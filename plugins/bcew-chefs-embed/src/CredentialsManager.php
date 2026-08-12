<?php

namespace Bcgov\BcewChefsEmbed;

/**
 * CredentialsManager - CHEFS form credentials storage.
 *
 * Storage-only helper for the custom credentials table (DSWP-1034).
 *
 * Table schema:
 * - form_id (string, primary key)
 * - api_key (string)
 * - created_at (timestamp)
 * - user_id (integer, WordPress user ID)
 */
class CredentialsManager {

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
	 * Plugin activation callback (single site or network-wide).
	 *
	 * @param bool $network_wide Whether the plugin is network-activated.
	 * @return void
	 */
	public static function activate( $network_wide ) {
		if ( is_multisite() && $network_wide ) {
			$site_ids = get_sites(
				array(
					'fields' => 'ids',
					'number' => 0,
				)
			);

			foreach ( $site_ids as $site_id ) {
				switch_to_blog( (int) $site_id );
				self::install();
				restore_current_blog();
			}

			return;
		}

		self::install();
	}

	/**
	 * Create the credentials table for a newly created multisite site.
	 *
	 * @param \WP_Site $new_site New site object.
	 * @return void
	 */
	public static function on_initialize_site( $new_site ) {
		if ( ! $new_site instanceof \WP_Site ) {
			return;
		}

		switch_to_blog( (int) $new_site->blog_id );
		self::install();
		restore_current_blog();
	}

	/**
	 * Create the credentials table via dbDelta.
	 *
	 * @return void
	 */
	public static function install() {
		self::create_table();
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
	 * Does not select api_key — the settings table only shows form_id + date
	 * and a Remove button. Keeps secrets off the HTML page.
	 *
	 * @return array<int,array{form_id:string,created_at:string}>
	 */
	public static function list_forms() {
		global $wpdb;

		$table = self::table_name();

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- no user input; table name cannot be parameterized.
		return $wpdb->get_results( 'SELECT form_id, created_at FROM `' . $table . '` ORDER BY created_at DESC', ARRAY_A );
	}

	/**
	 * Get a stored form record by form ID (primary key).
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

		return array(
			'form_id'    => $row['form_id'],
			'api_key'    => $row['api_key'],
			'created_at' => $row['created_at'],
			'user_id'    => (int) $row['user_id'],
		);
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

		if ( null === $user_id ) {
			$user_id = get_current_user_id();
		}

		$user_id = absint( $user_id );
		$table   = self::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared -- table name cannot be parameterized.
		$existing = (bool) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT 1 FROM `{$table}` WHERE form_id = %s LIMIT 1",
				$form_id
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared

		if ( $existing ) {
			$result = $wpdb->update(
				$table,
				array(
					'api_key' => $api_key,
					'user_id' => $user_id,
				),
				array( 'form_id' => $form_id ),
				array( '%s', '%d' ),
				array( '%s' )
			);
		} else {
			$result = $wpdb->insert(
				$table,
				array(
					'form_id' => $form_id,
					'api_key' => $api_key,
					'user_id' => $user_id,
				),
				array( '%s', '%s', '%d' )
			);
		}

		return false === $result ? false : $form_id;
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
	 * Create or update the credentials table via dbDelta.
	 *
	 * @return void
	 */
	private static function create_table() {
		global $wpdb;

		$table   = self::table_name();
		$charset = $wpdb->get_charset_collate();

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$sql = "CREATE TABLE {$table} (
			form_id varchar(36) NOT NULL,
			api_key longtext NOT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			user_id bigint(20) unsigned NOT NULL DEFAULT 0,
			PRIMARY KEY  (form_id),
			KEY user_id (user_id)
		) {$charset};";

		dbDelta( $sql );
	}
}
