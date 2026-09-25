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
 * The only supported algorithm is libsodium secretbox.
 */
class Crypto {

	/**
	 * Prefix so we know a stored value was produced by sodium secretbox.
	 */
	const PREFIX_SODIUM = 's1:';

	/**
	 * Encrypt a plaintext string (e.g. a CHEFS API key).
	 *
	 * @param string $plaintext Plaintext API key.
	 * @return string|false Ciphertext payload for the DB, or false on failure.
	 */
	public static function encrypt( $plaintext ) {
		/*
		 * Empty values are not credentials. Without secretbox there is no
		 * supported way to encrypt, so refuse instead of storing plaintext.
		 */
		if ( ! is_string( $plaintext ) || '' === $plaintext || ! function_exists( 'sodium_crypto_secretbox' ) ) {
			return false;
		}

		$key = self::get_key();

		/*
		 * The nonce is random and must never be reused with the same key.
		 * Hex-encoding nonce plus ciphertext keeps the binary box safe in a text column.
		 * The "s1:" prefix marks this as secretbox format version 1.
		 */
		$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
		$box   = sodium_crypto_secretbox( $plaintext, $nonce, $key );

		return self::PREFIX_SODIUM . bin2hex( $nonce . $box );
	}

	/**
	 * Decrypt a payload previously produced by encrypt().
	 *
	 * @param string $payload Ciphertext payload from the DB.
	 * @return string|false Plaintext API key, or false on failure.
	 */
	public static function decrypt( $payload ) {
		/*
		 * Only non-empty secretbox payloads can be opened. Anything else
		 * is treated as undecryptable.
		 */
		if ( ! is_string( $payload ) || '' === $payload || ! function_exists( 'sodium_crypto_secretbox_open' ) ) {
			return false;
		}

		if ( 0 !== strpos( $payload, self::PREFIX_SODIUM ) ) {
			return false;
		}

		$key = self::get_key();

		/*
		 * Strip "s1:" and turn the hex back into nonce plus ciphertext.
		 * A short or invalid payload cannot be a real secretbox.
		 * Opening the box fails when the key or nonce is wrong, or the data was changed.
		 */
		$raw = self::hex_to_bin( substr( $payload, strlen( self::PREFIX_SODIUM ) ) );

		if ( false === $raw || strlen( $raw ) < SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ) {
			return false;
		}

		$nonce = substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
		$box   = substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
		$plain = sodium_crypto_secretbox_open( $box, $nonce, $key );

		return false === $plain ? false : $plain;
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
		/*
		 * WordPress auth salts differ per environment, so this key does too.
		 * The plugin name keeps the key separate from other uses of the same salt.
		 * Raw SHA-256 is 32 bytes, which is the key length secretbox requires.
		 */
		return hash( 'sha256', wp_salt( 'auth' ) . '|bcew-chefs-embed', true );
	}
}
