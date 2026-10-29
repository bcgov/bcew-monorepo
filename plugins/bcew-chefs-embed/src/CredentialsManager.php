<?php

namespace Bcgov\BcewChefsEmbed;

/**
 * CredentialsManager - one row per saved CHEFS form.
 *
 * Table schema (`{prefix}bcew_chefs_credentials`):
 * - form_id (string, primary key)
 * - api_key (encrypted string)
 * - form_name (CHEFS form title)
 * - confirmation (custom success message)
 * - created_at (timestamp)
 * - user_id (integer, WordPress user ID)
 */
class CredentialsManager {
	use InstallsSiteTable;

	/**
	 * Credentials table schema version.
	 *
	 * Bump when table_definition() changes so existing installs re-run dbDelta.
	 */
	const DB_VERSION = '2';

	/**
	 * Option key storing the installed schema version.
	 */
	const DB_VERSION_OPTION = 'bcew_chefs_embed_db_version';

	/**
	 * Credentials table name (with WP prefix for the current site).
	 *
	 * @return string
	 */
	public static function table_name() {
		global $wpdb;

		return $wpdb->prefix . 'bcew_chefs_credentials';
	}

	/**
	 * Whether this site still has the options table from before the tables were combined.
	 *
	 * @return bool
	 */
	public static function has_legacy_options_table() {
		global $wpdb;

		$table = $wpdb->prefix . 'bcew_chefs_options';
		$found = $wpdb->get_var(
			$wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $table ) )
		);

		return $found === $table;
	}

	/**
	 * Copy form names and confirmations onto the credentials rows, then drop the old options table.
	 *
	 * The upgrade adds the form name and confirmation columns when the credentials
	 * table is still the older shape. The API key, created time, and user ID stay
	 * on the existing row.
	 *
	 * @return void
	 */
	public static function migrate_legacy_options_table() {
		global $wpdb;

		self::install();

		if ( ! self::has_legacy_options_table() ) {
			return;
		}

		$credentials = self::table_name();
		$options     = $wpdb->prefix . 'bcew_chefs_options';

		/*
		 * Copy the saved form name and confirmation onto the credentials row
		 * with the same Form ID. The old table used its own id as the primary
		 * key, so more than one row could exist for a form. The newest row is
		 * the one the settings page was showing.
		 */
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- table names from code.
		$copied = $wpdb->query(
			"UPDATE `{$credentials}` AS credentials
			INNER JOIN `{$options}` AS options
				ON credentials.form_id = options.chefs_credentials_id
			INNER JOIN (
				SELECT chefs_credentials_id, MAX(id) AS id
				FROM `{$options}`
				GROUP BY chefs_credentials_id
			) AS latest ON options.id = latest.id
			SET credentials.form_name = options.form_name,
				credentials.confirmation = options.confirmation"
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		if ( false === $copied ) {
			return;
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.SchemaChange -- old options table name from code.
		$dropped = $wpdb->query( "DROP TABLE IF EXISTS `{$options}`" );

		if ( false === $dropped ) {
			return;
		}

		delete_option( 'bcew_chefs_options_db_version' );
	}

	/**
	 * Remove a form by CHEFS form ID (hard delete).
	 *
	 * Used by the settings page Remove action.
	 * Deletes the entire credentials row — including the stored API key —
	 * so the form disappears from list_forms() / get_saved_form_ids().
	 *
	 * @param string $form_id CHEFS form ID (primary key).
	 * @return bool True when at least one row was deleted.
	 */
	public static function delete( $form_id ) {
		global $wpdb;

		// Normalize the ID the same way save()/get_by_form_id() do.
		$form_id = self::sanitize_form_id( $form_id );

		// Nothing to delete if the ID is empty after sanitize.
		if ( '' === $form_id ) {
			return false;
		}

		// $wpdb->delete builds a safe DELETE ... WHERE form_id = %s.
		$deleted = $wpdb->delete(
			self::table_name(),
			array( 'form_id' => $form_id ),
			array( '%s' )
		);

		// false = query error; 0 = no matching row; >0 = rows removed.
		return false !== $deleted && $deleted > 0;
	}

	/**
	 * List configured forms for the settings page.
	 *
	 * Does not select api_key — the settings table shows the form name, ID,
	 * date, and actions. Keeps secrets off the HTML page.
	 *
	 * @return array<int,array{form_id:string,form_name:string,created_at:string}>
	 */
	public static function list_forms() {
		global $wpdb;

		$table = self::table_name();

		return $wpdb->get_results(
			$wpdb->prepare(
				'SELECT form_id, form_name, created_at FROM %i ORDER BY created_at DESC',
				$table
			),
			ARRAY_A
		);
	}

	/**
	 * Get a stored form record by form ID (primary key).
	 *
	 * API key is decrypted for server-side use.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @return array{form_id:string,api_key:string,created_at:string,user_id:int}|null
	 */
	public static function get_by_form_id( $form_id ) {
		global $wpdb;

		$form_id = self::sanitize_form_id( $form_id );

		if ( '' === $form_id ) {
			return null;
		}

		$table = self::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared -- table name cannot be parameterized.
		$row = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT form_id, api_key, created_at, user_id FROM `{$table}` WHERE form_id = %s",
				$form_id
			),
			ARRAY_A
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared

		if ( ! is_array( $row ) ) {
			return null;
		}

		$api_key = Crypto::decrypt( $row['api_key'] );

		if ( false === $api_key ) {
			return null;
		}

		return array(
			'form_id'    => $row['form_id'],
			'api_key'    => $api_key,
			'created_at' => $row['created_at'],
			'user_id'    => (int) $row['user_id'],
		);
	}

	/**
	 * Check whether a credentials row exists without decrypting its API key.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @return bool
	 */
	public static function form_exists( $form_id ) {
		global $wpdb;

		$form_id = self::sanitize_form_id( $form_id );

		if ( '' === $form_id ) {
			return false;
		}

		$table = self::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared -- table name cannot be parameterized.
		$exists = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT 1 FROM `{$table}` WHERE form_id = %s LIMIT 1",
				$form_id
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared

		return '1' === (string) $exists;
	}

	/**
	 * Get all saved CHEFS form IDs.
	 *
	 * @return string[]
	 */
	public static function get_saved_form_ids() {
		global $wpdb;

		$table = self::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared -- table name cannot be parameterized.
		$form_ids = $wpdb->get_col( "SELECT form_id FROM `{$table}` ORDER BY created_at DESC" );
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared

		if ( ! is_array( $form_ids ) ) {
			return array();
		}

		return array_map(
			'trim',
			array_filter(
				array_map( 'sanitize_text_field', $form_ids ),
				'strlen'
			)
		);
	}

	/**
	 * Save or update credentials for a CHEFS form.
	 *
	 * @param string   $form_id CHEFS form ID.
	 * @param string   $api_key Form API key.
	 * @param int|null $user_id WordPress user ID; defaults to current user.
	 * @return string|false Form ID on success.
	 */
	public static function save( $form_id, $api_key, $user_id = null ) {
		global $wpdb;

		$form_id = self::sanitize_form_id( $form_id );
		$api_key = trim( (string) $api_key );

		if ( '' === $form_id || '' === $api_key ) {
			return false;
		}

		$api_key_encrypted = Crypto::encrypt( $api_key );

		if ( false === $api_key_encrypted ) {
			return false;
		}

		if ( null === $user_id ) {
			$user_id = get_current_user_id();
		}

		$user_id = absint( $user_id );
		$table   = self::table_name();

		/*
		 * The primary key decides insert versus update, so a separate
		 * existence query is unnecessary. A second save replaces the key
		 * and user only. Form name and confirmation stay on the row.
		 */
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared -- table name cannot be parameterized.
		$result = $wpdb->query(
			$wpdb->prepare(
				"INSERT INTO `{$table}` (form_id, api_key, form_name, confirmation, user_id)
				VALUES (%s, %s, '', '', %d)
				ON DUPLICATE KEY UPDATE api_key = VALUES(api_key), user_id = VALUES(user_id)",
				$form_id,
				$api_key_encrypted,
				$user_id
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared

		return false === $result ? false : $form_id;
	}

	/**
	 * Look up a confirmation message by CHEFS form ID.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @return string|null Confirmation text, or null when missing or blank.
	 */
	public static function get_confirmation( $form_id ) {
		return self::get_text_column( 'confirmation', $form_id );
	}

	/**
	 * Look up the stored CHEFS form title.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @return string|null Form title, or null when missing or blank.
	 */
	public static function get_form_name( $form_id ) {
		return self::get_text_column( 'form_name', $form_id );
	}

	/**
	 * Save a CHEFS form title on an existing form row.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @param string $form_name CHEFS form title.
	 * @return string|false Form ID on success, false on failure.
	 */
	public static function save_form_name( $form_id, $form_name ) {
		$form_id   = self::sanitize_form_id( $form_id );
		$form_name = trim( sanitize_text_field( (string) $form_name ) );

		if ( '' === $form_id || '' === $form_name ) {
			return false;
		}

		return self::update_text_column( 'form_name', $form_id, $form_name );
	}

	/**
	 * Save a confirmation message on an existing form row.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @param string $message Confirmation text.
	 * @return string|false Form ID on success, false on failure.
	 */
	public static function save_confirmation( $form_id, $message ) {
		/*
		 * Sanitize the form ID and message so they are safe to store.
		 * A message that is only whitespace is treated as empty. If either
		 * value is empty, return false instead of saving a blank message.
		 * To remove an existing message, use clear_confirmation().
		 */
		$form_id = self::sanitize_form_id( $form_id );
		$message = trim( sanitize_textarea_field( (string) $message ) );

		if ( '' === $form_id || '' === $message ) {
			return false;
		}

		return self::update_text_column( 'confirmation', $form_id, $message );
	}

	/**
	 * Clear a confirmation while preserving the form name and API key.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @return bool True when the form row exists and the message is cleared.
	 */
	public static function clear_confirmation( $form_id ) {
		$form_id = self::sanitize_form_id( $form_id );

		if ( '' === $form_id ) {
			return false;
		}

		return false !== self::update_text_column( 'confirmation', $form_id, '' );
	}

	/**
	 * Read a text column, treating a blank value as missing.
	 *
	 * @param string $column  form_name or confirmation.
	 * @param string $form_id CHEFS form ID.
	 * @return string|null
	 */
	private static function get_text_column( $column, $form_id ) {
		global $wpdb;

		if ( ! in_array( $column, array( 'form_name', 'confirmation' ), true ) ) {
			return null;
		}

		$form_id = self::sanitize_form_id( $form_id );

		if ( '' === $form_id ) {
			return null;
		}

		$table = self::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- column allow-list; table name from code.
		$value = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT `{$column}` FROM `{$table}` WHERE form_id = %s",
				$form_id
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared

		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return null;
		}

		return $value;
	}

	/**
	 * Update one text column on an existing form row.
	 *
	 * @param string $column  form_name or confirmation.
	 * @param string $form_id CHEFS form ID.
	 * @param string $value   Stored value.
	 * @return string|false Form ID on success, false when the form row is missing.
	 */
	private static function update_text_column( $column, $form_id, $value ) {
		global $wpdb;

		$updated = $wpdb->update(
			self::table_name(),
			array( $column => $value ),
			array( 'form_id' => $form_id ),
			array( '%s' ),
			array( '%s' )
		);

		if ( false === $updated ) {
			return false;
		}

		if ( $updated > 0 || self::form_exists( $form_id ) ) {
			return $form_id;
		}

		return false;
	}

	/**
	 * Normalize a form ID for storage and lookup.
	 *
	 * @param string $form_id Form ID.
	 * @return string
	 */
	private static function sanitize_form_id( $form_id ) {
		return trim( sanitize_text_field( $form_id ) );
	}

	/**
	 * Column and index definitions for the credentials table.
	 *
	 * @return string
	 */
	protected static function table_definition() {
		return '
			form_id varchar(36) NOT NULL,
			api_key longtext NOT NULL,
			form_name varchar(255) NOT NULL DEFAULT \'\',
			confirmation longtext NOT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (form_id),
			KEY user_id (user_id)
		';
	}
}
