<?php
/**
 * Encrypt / decrypt CHEFS secrets at rest.
 *
 * @package bcew-chefs-form
 */

namespace Bcgov\BcewChefsForm;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Symmetric encryption helpers for stored form credentials.
 */
class Crypto {

	const PREFIX_SODIUM  = 's1:';
	const PREFIX_OPENSSL = 'o1:';

	/**
	 * Encrypt a plaintext string.
	 *
	 * @param string $plaintext Plaintext.
	 * @return string|false Ciphertext payload, or false on failure.
	 */
	public static function encrypt( $plaintext ) {
		if ( ! is_string( $plaintext ) || '' === $plaintext ) {
			return false;
		}

		$key = self::get_key();

		if ( function_exists( 'sodium_crypto_secretbox' ) ) {
			$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
			$box   = sodium_crypto_secretbox( $plaintext, $nonce, $key );

			return self::PREFIX_SODIUM . base64_encode( $nonce . $box );
		}

		if ( function_exists( 'openssl_encrypt' ) ) {
			$iv         = random_bytes( 12 );
			$tag        = '';
			$ciphertext = openssl_encrypt( $plaintext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag );

			if ( false === $ciphertext ) {
				return false;
			}

			return self::PREFIX_OPENSSL . base64_encode( $iv . $tag . $ciphertext );
		}

		return false;
	}

	/**
	 * Decrypt a payload from encrypt().
	 *
	 * @param string $payload Ciphertext payload.
	 * @return string|false Plaintext, or false on failure.
	 */
	public static function decrypt( $payload ) {
		if ( ! is_string( $payload ) || '' === $payload ) {
			return false;
		}

		$key = self::get_key();

		if ( 0 === strpos( $payload, self::PREFIX_SODIUM ) ) {
			if ( ! function_exists( 'sodium_crypto_secretbox_open' ) ) {
				return false;
			}

			$raw = base64_decode( substr( $payload, strlen( self::PREFIX_SODIUM ) ), true );

			if ( false === $raw || strlen( $raw ) < SODIUM_CRYPTO_SECRETBOX_NONCEBYTES ) {
				return false;
			}

			$nonce = substr( $raw, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
			$box   = substr( $raw, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );
			$plain = sodium_crypto_secretbox_open( $box, $nonce, $key );

			return false === $plain ? false : $plain;
		}

		if ( 0 === strpos( $payload, self::PREFIX_OPENSSL ) ) {
			if ( ! function_exists( 'openssl_decrypt' ) ) {
				return false;
			}

			$raw = base64_decode( substr( $payload, strlen( self::PREFIX_OPENSSL ) ), true );

			if ( false === $raw || strlen( $raw ) < 28 ) {
				return false;
			}

			$iv         = substr( $raw, 0, 12 );
			$tag        = substr( $raw, 12, 16 );
			$ciphertext = substr( $raw, 28 );
			$plain      = openssl_decrypt( $ciphertext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag );

			return false === $plain ? false : $plain;
		}

		return false;
	}

	/**
	 * 32-byte key derived from WordPress auth salts.
	 *
	 * @return string
	 */
	private static function get_key() {
		return hash( 'sha256', wp_salt( 'auth' ) . '|bcew-chefs-form', true );
	}
}
