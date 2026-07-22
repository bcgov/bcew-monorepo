<?php
/**
 * Server-side storage for CHEFS form credentials.
 *
 * Form IDs are stored in plaintext for block lookup. API keys are encrypted at rest.
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

	const TABLE_VERSION  = 1;
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
	 * Create the credentials table.
	 *
	 * @return void
	 */
	public static function install() {
		self::create_table();
		update_option( self::DB_VERSION_KEY, self::TABLE_VERSION, false );
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
	 * Check whether a form ID exists in the table.
	 *
	 * @param string $form_id CHEFS form UUID.
	 * @return bool
	 */
	public static function exists( $form_id ) {
		global $wpdb;

		$form_id = self::sanitize_form_id( $form_id );

		if ( '' === $form_id ) {
			return false;
		}

		return (bool) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT 1 FROM ' . self::table_name() . ' WHERE form_id = %s LIMIT 1',
				$form_id
			)
		);
	}

	/**
	 * Get a stored form record by form ID (decrypted API key for server use).
	 *
	 * @param string $form_id CHEFS form UUID.
	 * @return array{form_id:string,api_key:string,label:string}|null
	 */
	public static function get_by_form_id( $form_id ) {
		global $wpdb;

		$form_id = self::sanitize_form_id( $form_id );

		if ( '' === $form_id ) {
			return null;
		}

		$row = $wpdb->get_row(
			$wpdb->prepare(
				'SELECT label, form_id, api_key_encrypted FROM ' . self::table_name() . ' WHERE form_id = %s',
				$form_id
			),
			ARRAY_A
		);

		if ( ! is_array( $row ) ) {
			return null;
		}

		$api_key = BCEW_Chefs_Crypto::decrypt( $row['api_key_encrypted'] );

		if ( false === $api_key ) {
			return null;
		}

		return array(
			'form_id' => $row['form_id'],
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
	 * @return string|false Form ID on success.
	 */
	public static function save( $form_id, $api_key, $label = '' ) {
		global $wpdb;

		$form_id = self::sanitize_form_id( $form_id );
		$api_key = trim( $api_key );
		$label   = sanitize_text_field( $label );

		if ( '' === $form_id || '' === $api_key ) {
			return false;
		}

		$api_key_encrypted = BCEW_Chefs_Crypto::encrypt( $api_key );

		if ( false === $api_key_encrypted ) {
			return false;
		}

		if ( ! $label ) {
			$label = __( 'CHEFS form', 'bcew-chefs-form' );
		}

		$table    = self::table_name();
		$existing = self::exists( $form_id );

		$data    = array(
			'form_id'           => $form_id,
			'label'             => $label,
			'api_key_encrypted' => $api_key_encrypted,
		);
		$formats = array( '%s', '%s', '%s' );

		if ( $existing ) {
			$result = $wpdb->update( $table, $data, array( 'form_id' => $form_id ), $formats, array( '%s' ) );
		} else {
			$result = $wpdb->insert( $table, $data, $formats );
		}

		return false === $result ? false : $form_id;
	}

	/**
	 * Remove a form by CHEFS form ID.
	 *
	 * @param string $form_id CHEFS form UUID.
	 * @return bool
	 */
	public static function delete( $form_id ) {
		global $wpdb;

		$form_id = self::sanitize_form_id( $form_id );

		if ( '' === $form_id ) {
			return false;
		}

		$deleted = $wpdb->delete(
			self::table_name(),
			array( 'form_id' => $form_id ),
			array( '%s' )
		);

		return false !== $deleted && $deleted > 0;
	}

	/**
	 * List configured forms for UI (never includes API key).
	 *
	 * @return array<int,array{formId:string,label:string}>
	 */
	public static function list_forms() {
		global $wpdb;

		$rows = $wpdb->get_results(
			'SELECT form_id, label FROM ' . self::table_name() . ' ORDER BY label ASC',
			ARRAY_A
		);

		$list = array();

		if ( ! is_array( $rows ) ) {
			return $list;
		}

		foreach ( $rows as $row ) {
			$list[] = array(
				'formId' => $row['form_id'],
				'label'  => $row['label'] ?: __( 'CHEFS form', 'bcew-chefs-form' ),
			);
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
	 * Normalize and validate a CHEFS form UUID for storage and lookup.
	 *
	 * @param string $form_id Form ID.
	 * @return string Empty string when invalid.
	 */
	public static function sanitize_form_id( $form_id ) {
		$form_id = strtolower( trim( sanitize_text_field( $form_id ) ) );

		return self::is_valid_form_id( $form_id ) ? $form_id : '';
	}

	/**
	 * Create the credentials table via dbDelta.
	 *
	 * @return void
	 */
	private static function create_table() {
		global $wpdb;

		$table   = self::table_name();
		$charset = $wpdb->get_charset_collate();

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$sql = "CREATE TABLE {$table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			form_id char(36) NOT NULL,
			label varchar(255) NOT NULL DEFAULT '',
			api_key_encrypted longtext NOT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY form_id (form_id)
		) {$charset};";

		dbDelta( $sql );
	}
}
