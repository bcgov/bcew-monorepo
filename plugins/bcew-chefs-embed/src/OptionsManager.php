<?php
/**
 * CHEFS form options storage (confirmations, etc.).
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed;

/**
 * OptionsManager - additional per-form options (DSWP-1152).
 *
 * Table schema (`{prefix}bcew_chefs_options`):
 * - id (primary, auto-increment)
 * - chefs_credentials_id (CHEFS form ID)
 * - confirmation (string)
 */
class OptionsManager {

	/**
	 * Options table schema version.
	 *
	 * Bump when create_table() changes so existing installs re-run dbDelta.
	 */
	const DB_VERSION = '1';

	/**
	 * Option key storing the installed schema version.
	 */
	const DB_VERSION_OPTION = 'bcew_chefs_options_db_version';

	/**
	 * Options table name (with WP prefix for the current site).
	 *
	 * @return string
	 */
	public static function table_name() {
		global $wpdb;

		return $wpdb->prefix . 'bcew_chefs_options';
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
	 * Create the options table for a newly created multisite site.
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
	 * Create the options table via dbDelta.
	 *
	 * @return void
	 */
	public static function install() {
		self::create_table();
		update_option( self::DB_VERSION_OPTION, self::DB_VERSION, true );
	}

	/**
	 * Look up a confirmation message by CHEFS form / credentials ID.
	 *
	 * @param string $chefs_credentials_id CHEFS form ID.
	 * @return string|null Confirmation text, or null when not found.
	 */
	public static function get_confirmation( $chefs_credentials_id ) {
		global $wpdb;

		$chefs_credentials_id = self::sanitize_credentials_id( $chefs_credentials_id );
		if ( '' === $chefs_credentials_id ) {
			return null;
		}

		$table = self::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared -- table name cannot be parameterized.
		$confirmation = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT confirmation FROM `{$table}` WHERE chefs_credentials_id = %s ORDER BY id DESC LIMIT 1",
				$chefs_credentials_id
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared

		return is_string( $confirmation ) ? $confirmation : null;
	}

	/**
	 * Normalize a credentials / form ID for storage and lookup.
	 *
	 * @param string $chefs_credentials_id CHEFS form ID.
	 * @return string
	 */
	private static function sanitize_credentials_id( $chefs_credentials_id ) {
		return trim( sanitize_text_field( $chefs_credentials_id ) );
	}

	/**
	 * Create or update the options table via dbDelta.
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
			chefs_credentials_id varchar(36) NOT NULL,
			confirmation longtext NOT NULL,
			PRIMARY KEY  (id),
			KEY chefs_credentials_id (chefs_credentials_id)
		) {$charset};";

		dbDelta( $sql );
	}
}
