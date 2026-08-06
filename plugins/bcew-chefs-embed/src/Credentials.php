<?php
/**
 * Server-side storage for CHEFS form credentials.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages CHEFS API credentials for the site.
 */
class Credentials {
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
	private static function create_table() {
		global $wpdb;

		// Ensure dbDelta is available.
		if ( ! function_exists( 'dbDelta' ) ) {
			require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		}

		$table   = self::table_name();
		$charset = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE {$table} (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			form_id varchar(191) NOT NULL,
			api_key longtext NOT NULL,
			user_id bigint(20) unsigned NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			UNIQUE KEY form_id (form_id)
		) {$charset};";

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
		\dbDelta( $sql );
	}

	/**
	 * Initialize the credentials table if it doesn't exist.
	 *
	 * @return void
	 */
	public static function maybe_install() {
		$version = get_option( self::DB_VERSION_KEY );

		if ( $version >= self::TABLE_VERSION ) {
			return;
		}

		self::create_table();
		update_option( self::DB_VERSION_KEY, self::TABLE_VERSION );
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

		$table = self::table_name();
		return (bool) $wpdb->get_var(
			$wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- Table name is generated from the trusted WordPress database prefix.
				'SELECT 1 FROM ' . $table . ' WHERE form_id = %s LIMIT 1',
				$form_id
			)
		);
	}

	/**
	 * Get a stored form record by form ID.
	 *
	 * @param string $form_id CHEFS form UUID.
	 * @return array{form_id:string,api_key:string}|null
	 */
	public static function get( $form_id ) {
		global $wpdb;
		$form_id = self::sanitize_form_id( $form_id );

		if ( '' === $form_id ) {
			return null;
		}

		$table = self::table_name();
		$row   = $wpdb->get_row(
			$wpdb->prepare(
				// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- Table name is generated from the trusted WordPress database prefix.
				'SELECT form_id, api_key FROM ' . $table . ' WHERE form_id = %s',
				$form_id
			),
			ARRAY_A
		);

		if ( ! is_array( $row ) ) {
			return null;
		}

		return array(
			'form_id' => $row['form_id'],
			'api_key' => $row['api_key'],
		);
	}

	/**
	 * Save or update credentials for a CHEFS form.
	 *
	 * @param string $form_id CHEFS form UUID.
	 * @param string $api_key Form API key.
	 * @return string|false Form ID on success, false on failure.
	 */
	public static function save( $form_id, $api_key ) {
		global $wpdb;
		$form_id = self::sanitize_form_id( $form_id );
		$api_key = trim( $api_key );

		if ( '' === $form_id || '' === $api_key ) {
			return false;
		}

		self::maybe_install();

		$table   = self::table_name();
		$user_id = get_current_user_id();
		$data    = array(
			'form_id' => $form_id,
			'api_key' => $api_key,
			'user_id' => $user_id,
		);
		$formats = array( '%s', '%s', '%d' );

		// Check if form_id already exists (primary key constraint).
		if ( self::exists( $form_id ) ) {
			// Update existing record.
			$result = $wpdb->update(
				$table,
				$data,
				array( 'form_id' => $form_id ),
				$formats,
				array( '%s' )
			);
		} else {
			// Insert new record.
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

		$table   = self::table_name();
		$deleted = $wpdb->delete(
			$table,
			array( 'form_id' => $form_id ),
			array( '%s' )
		);

		return false !== $deleted && $deleted > 0;
	}

	/**
	 * List configured form IDs for UI (never includes API key).
	 *
	 * @return array<int,string>
	 */
	public static function list_forms() {
		global $wpdb;
		self::maybe_install();

		$table = self::table_name();
		return $wpdb->get_col(
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- Table name is generated from the trusted WordPress database prefix.
			'SELECT form_id FROM ' . $table . ' ORDER BY created_at DESC'
		);
	}

	/**
	 * Sanitize form ID.
	 *
	 * @param mixed $form_id Input value.
	 * @return string Sanitized form ID.
	 */
	public static function sanitize_form_id( $form_id ) {
		return sanitize_text_field( (string) $form_id );
	}
}
