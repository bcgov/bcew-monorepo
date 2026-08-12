<?php
/**
 * Encrypt / decrypt CHEFS secrets at rest.
 *
 * Stores API keys in the DB as ciphertext so a DB dump alone is not enough
 * to read them. Key material comes from this WordPress install's salts.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed;

// Block direct browser access to this PHP file outside WordPress.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Symmetric encryption helpers for stored form credentials.
 *
 * "Symmetric" = same key encrypts and decrypts (unlike public/private key pairs).
 */
class Crypto {

	/**
	 * Version prefixes so we know which algorithm produced a stored value.
	 * Lets us change crypto later without breaking old rows.
	 */
	const PREFIX_SODIUM  = 's1:'; // Sodium secretbox, format version 1.
	const PREFIX_OPENSSL = 'o1:'; // OpenSSL AES-256-GCM, format version 1.

	/**
	 * Encrypt a plaintext string (e.g. a CHEFS API key).
	 *
	 * Prefers libsodium when available; falls back to OpenSSL AES-GCM.
	 *
	 * @param string $plaintext Plaintext API key.
	 * @return string|false Ciphertext payload for the DB, or false on failure.
	 */
	public static function encrypt( $plaintext ) {
		// Reject non-strings and empty strings — nothing useful to encrypt.
		if ( ! is_string( $plaintext ) || '' === $plaintext ) {
			return false;
		}

		// 32-byte key derived from this site's WordPress auth salts.
		$key = self::get_key();

		// Preferred path: libsodium (modern, hard to misuse).
		if ( function_exists( 'sodium_crypto_secretbox' ) ) {
			// Nonce = one-time random value; never reuse with the same key.
			$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
			// Encrypt+authenticate the plaintext into a binary "box".
			$box = sodium_crypto_secretbox( $plaintext, $nonce, $key );

			// Store as: "s1:" + hex( nonce + ciphertext ).
			// Hex keeps binary ciphertext safe for a text DB column.
			return self::PREFIX_SODIUM . bin2hex( $nonce . $box );
		}

		// Fallback if sodium is missing: AES-256-GCM via OpenSSL.
		if ( function_exists( 'openssl_encrypt' ) ) {
			// IV (initialization vector) = random per encryption, like a nonce.
			$iv = random_bytes( 12 );
			// GCM auth tag is filled in by openssl_encrypt by reference.
			$tag        = '';
			$ciphertext = openssl_encrypt( $plaintext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag );

			// OpenSSL returns false if encryption failed.
			if ( false === $ciphertext ) {
				return false;
			}

			// Store as: "o1:" + hex( iv + tag + ciphertext ).
			return self::PREFIX_OPENSSL . bin2hex( $iv . $tag . $ciphertext );
		}

		// Neither sodium nor openssl available — cannot encrypt.
		return false;
	}

	/**
	 * Decrypt a payload previously produced by encrypt().
	 *
	 * Chooses the algorithm from the prefix (s1: vs o1:).
	 *
	 * @param string $payload Ciphertext payload from the DB.
	 * @return string|false Plaintext API key, or false on failure.
	 */
	public static function decrypt( $payload ) {
		// Same guard as encrypt: need a non-empty string.
		if ( ! is_string( $payload ) || '' === $payload ) {
			return false;
		}

		// Must use the same key that encrypted the value (same WP salts).
		$key = self::get_key();

		// Sodium payload path.
		if ( 0 === strpos( $payload, self::PREFIX_SODIUM ) ) {
			// Can't decrypt sodium if the extension isn't loaded on this server.
			if ( ! function_exists( 'sodium_crypto_secretbox_open' ) ) {
				return false;
			}

			// Strip "s1:" then hex-decode back to raw binary (nonce + box).
			$raw = self::hex_to_bin( substr( $payload, strlen( self::PREFIX_SODIUM ) ) );

			// Invalid hex, or too short to contain a full nonce.
			if ( false === $raw || strlen( $raw ) < SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ) {
				return false;
			}

			// First N bytes = nonce; remainder = ciphertext box.
			$nonce = substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
			$box   = substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
			// Returns plaintext, or false if key/nonce wrong or data tampered.
			$plain = sodium_crypto_secretbox_open( $box, $nonce, $key );

			return false === $plain ? false : $plain;
		}

		// OpenSSL AES-GCM payload path.
		if ( 0 === strpos( $payload, self::PREFIX_OPENSSL ) ) {
			if ( ! function_exists( 'openssl_decrypt' ) ) {
				return false;
			}

			// Strip "o1:" then decode binary: iv (12) + tag (16) + ciphertext.
			$raw = self::hex_to_bin( substr( $payload, strlen( self::PREFIX_OPENSSL ) ) );

			// 12 + 16 = 28 minimum bytes before any ciphertext.
			if ( false === $raw || strlen( $raw ) < 28 ) {
				return false;
			}

			$iv         = substr( $raw, 0, 12 );  // Initialization vector.
			$tag        = substr( $raw, 12, 16 ); // GCM authentication tag.
			$ciphertext = substr( $raw, 28 );     // Actual encrypted bytes.
			$plain      = openssl_decrypt( $ciphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag );

			// false if wrong key, wrong tag (tampered), or decrypt error.
			return false === $plain ? false : $plain;
		}

		// Unknown prefix (legacy plaintext, corrupt row, or future format we don't know).
		return false;
	}

	/**
	 * Decode a hex string to binary, or false if invalid.
	 *
	 * @param string $hex Hex-encoded binary data.
	 * @return string|false
	 */
	private static function hex_to_bin( $hex ) {
		if ( '' === $hex || 1 === strlen( $hex ) % 2 || ! ctype_xdigit( $hex ) ) {
			return false;
		}

		return hex2bin( $hex );
	}

	/**
	 * Build a 32-byte encryption key from this WordPress install's auth salts.
	 *
	 * Important: different environments (local/test/staging/prod) usually have
	 * different salts in wp-config.php, so ciphertext from one env will not
	 * decrypt in another after a DB-only migration.
	 *
	 * @return string Raw 32-byte binary key (not hex).
	 */
	private static function get_key() {
		// wp_salt( 'auth' ) = AUTH_KEY / AUTH_SALT from wp-config (or Docker env).
		// '|bcew-chefs-embed' namespaces the key so it isn't identical to other uses of the same salt.
		// hash( ..., true ) = raw binary SHA-256 (32 bytes), required by sodium/openssl.
		return hash( 'sha256', wp_salt( 'auth' ) . '|bcew-chefs-embed', true );
	}
}
