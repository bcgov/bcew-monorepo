<?php
/**
 * Server-side storage for CHEFS form credentials.
 *
 * Credentials live in a dedicated table with encrypted form ID and API key.
 *
 * @package bcew-chefs-form
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages CHEFS API credentials for the site.
 */
class BCEW_Chefs_Credentials {

	const OPTION_KEY    = 'bcew_chefs_forms';
	const TABLE_VERSION = 1;
	const DB_VERSION_KEY = 'bcew_chefs_credentials_db_version';

	/**
	 * Credentials table name (with WP prefix).
	 *
	 * @return string
	 */
	public static function table_name() {
		global $wpdb;

		return $wpdb->prefix . 'bcew_chefs_credentials';
	}

	/**
	 * Create or update the credentials table.
	 *
	 * @return void
	 */
	public static function install() {
		global $wpdb;

		$table   = self::table_name();
		$charset = $wpdb->get_charset_collate();

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$sql = "CREATE TABLE {$table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			embed_ref char(32) NOT NULL,
			label varchar(255) NOT NULL DEFAULT '',
			form_id_hash char(64) NOT NULL,
			form_id_encrypted longtext NOT NULL,
			api_key_encrypted longtext NOT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY embed_ref (embed_ref),
			UNIQUE KEY form_id_hash (form_id_hash)
		) {$charset};";

		dbDelta( $sql );
		update_option( self::DB_VERSION_KEY, self::TABLE_VERSION, false );
		self::migrate_from_option();
	}

	/**
	 * Ensure schema exists (activation + upgrades).
	 *
	 * @return void
	 */
	public static function maybe_install() {
		if ( (int) get_option( self::DB_VERSION_KEY, 0 ) < self::TABLE_VERSION ) {
			self::install();
		}
	}

	/**
	 * Get a stored form record by embed reference (decrypted for server use).
	 *
	 * @param string $embed_ref Opaque embed reference.
	 * @return array{form_id:string,api_key:string,label:string}|null
	 */
	public static function get_by_embed_ref( $embed_ref ) {
		global $wpdb;

		$embed_ref = sanitize_key( $embed_ref );

		if ( '' === $embed_ref || ! self::is_valid_embed_ref( $embed_ref ) ) {
			return null;
		}

		$row = $wpdb->get_row(
			$wpdb->prepare(
				'SELECT label, form_id_encrypted, api_key_encrypted FROM ' . self::table_name() . ' WHERE embed_ref = %s',
				$embed_ref
			),
			ARRAY_A
		);

		if ( ! is_array( $row ) ) {
			return null;
		}

		$form_id = BCEW_Chefs_Crypto::decrypt( $row['form_id_encrypted'] );
		$api_key = BCEW_Chefs_Crypto::decrypt( $row['api_key_encrypted'] );

		if ( false === $form_id || false === $api_key ) {
			return null;
		}

		return array(
			'form_id' => $form_id,
			'api_key' => $api_key,
			'label'   => $row['label'],
		);
	}

	/**
	 * Save or update credentials for a CHEFS form.
	 *
	 * @param string $form_id CHEFS form UUID.
	 * @param string $api_key Form API key.
	 * @param string $label   Optional admin label.
	 * @return string|false Embed reference on success.
	 */
	public static function save( $form_id, $api_key, $label = '' ) {
		global $wpdb;

		$form_id = strtolower( trim( $form_id ) );
		$api_key = trim( $api_key );
		$label   = sanitize_text_field( $label );

		if ( ! self::is_valid_form_id( $form_id ) || '' === $api_key ) {
			return false;
		}

		$form_id_encrypted = BCEW_Chefs_Crypto::encrypt( $form_id );
		$api_key_encrypted = BCEW_Chefs_Crypto::encrypt( $api_key );

		if ( false === $form_id_encrypted || false === $api_key_encrypted ) {
			return false;
		}

		$form_id_hash = BCEW_Chefs_Crypto::hash_form_id( $form_id );
		$table        = self::table_name();
		$existing     = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT embed_ref FROM {$table} WHERE form_id_hash = %s",
				$form_id_hash
			),
			ARRAY_A
		);

		$embed_ref = ( is_array( $existing ) && ! empty( $existing['embed_ref'] ) )
			? $existing['embed_ref']
			: bin2hex( random_bytes( 16 ) );

		if ( ! $label ) {
			$label = __( 'CHEFS form', 'bcew-chefs-form' );
		}

		$data = array(
			'embed_ref'          => $embed_ref,
			'label'              => $label,
			'form_id_hash'       => $form_id_hash,
			'form_id_encrypted'  => $form_id_encrypted,
			'api_key_encrypted'  => $api_key_encrypted,
		);
		$formats = array( '%s', '%s', '%s', '%s', '%s' );

		if ( is_array( $existing ) ) {
			$result = $wpdb->update( $table, $data, array( 'embed_ref' => $embed_ref ), $formats, array( '%s' ) );
		} else {
			$result = $wpdb->insert( $table, $data, $formats );
		}

		return false === $result ? false : $embed_ref;
	}

	/**
	 * Remove a form by embed reference.
	 *
	 * @param string $embed_ref Opaque embed reference.
	 * @return bool
	 */
	public static function delete( $embed_ref ) {
		global $wpdb;

		$embed_ref = sanitize_key( $embed_ref );

		if ( ! self::is_valid_embed_ref( $embed_ref ) ) {
			return false;
		}

		$deleted = $wpdb->delete(
			self::table_name(),
			array( 'embed_ref' => $embed_ref ),
			array( '%s' )
		);

		return false !== $deleted && $deleted > 0;
	}

	/**
	 * List configured forms for UI (never includes API key; form ID only when requested).
	 *
	 * @param bool $include_form_id Include decrypted CHEFS UUID (avoid for admin screens).
	 * @return array<int,array<string,string>>
	 */
	public static function list_forms( $include_form_id = false ) {
		global $wpdb;

		$rows = $wpdb->get_results(
			'SELECT embed_ref, label, form_id_encrypted FROM ' . self::table_name() . ' ORDER BY label ASC',
			ARRAY_A
		);

		$list = array();

		if ( ! is_array( $rows ) ) {
			return $list;
		}

		foreach ( $rows as $row ) {
			$item = array(
				'embedRef'  => $row['embed_ref'],
				'embed_ref' => $row['embed_ref'],
				'label'     => $row['label'] ?: __( 'CHEFS form', 'bcew-chefs-form' ),
			);

			if ( $include_form_id ) {
				$form_id = BCEW_Chefs_Crypto::decrypt( $row['form_id_encrypted'] );
				if ( false !== $form_id ) {
					$item['form_id'] = $form_id;
				}
			}

			$list[] = $item;
		}

		return $list;
	}

	/**
	 * Validate a CHEFS form UUID.
	 *
	 * @param string $form_id Form ID.
	 * @return bool
	 */
	public static function is_valid_form_id( $form_id ) {
		return (bool) preg_match(
			'/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i',
			$form_id
		);
	}

	/**
	 * Validate an embed reference.
	 *
	 * @param string $embed_ref Embed reference.
	 * @return bool
	 */
	public static function is_valid_embed_ref( $embed_ref ) {
		return (bool) preg_match( '/^[a-f0-9]{32}$/i', $embed_ref );
	}

	/**
	 * One-time migrate plaintext option storage into the encrypted table.
	 *
	 * @return void
	 */
	private static function migrate_from_option() {
		global $wpdb;

		$forms = get_option( self::OPTION_KEY, null );

		if ( ! is_array( $forms ) || array() === $forms ) {
			return;
		}

		$table = self::table_name();

		foreach ( $forms as $embed_ref => $record ) {
			$embed_ref = sanitize_key( $embed_ref );
			$form_id   = strtolower( trim( $record['form_id'] ?? '' ) );
			$api_key   = trim( $record['api_key'] ?? '' );
			$label     = sanitize_text_field( $record['label'] ?? '' );

			if ( ! self::is_valid_embed_ref( $embed_ref ) || ! self::is_valid_form_id( $form_id ) || '' === $api_key ) {
				continue;
			}

			$form_id_encrypted = BCEW_Chefs_Crypto::encrypt( $form_id );
			$api_key_encrypted = BCEW_Chefs_Crypto::encrypt( $api_key );

			if ( false === $form_id_encrypted || false === $api_key_encrypted ) {
				continue;
			}

			$wpdb->replace(
				$table,
				array(
					'embed_ref'         => $embed_ref,
					'label'             => $label ? $label : __( 'CHEFS form', 'bcew-chefs-form' ),
					'form_id_hash'      => BCEW_Chefs_Crypto::hash_form_id( $form_id ),
					'form_id_encrypted' => $form_id_encrypted,
					'api_key_encrypted' => $api_key_encrypted,
				),
				array( '%s', '%s', '%s', '%s', '%s' )
			);
		}

		delete_option( self::OPTION_KEY );
	}
}
