<?php
/**
 * Shared multisite-aware table install lifecycle.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed;

/**
 * Activation, install, and new-site hooks for custom tables.
 *
 * Using classes provide table_name() and table_definition(); this trait
 * owns activate / install / dbDelta / multisite switching.
 */
trait InstallsSiteTable {

	/**
	 * Prefixed table name for the current site.
	 *
	 * @return string
	 */
	abstract public static function table_name();

	/**
	 * Column and index lines for dbDelta (inside CREATE TABLE).
	 *
	 * @return string
	 */
	abstract protected static function table_definition();

	/**
	 * Create or upgrade the table and record the schema version.
	 *
	 * Only records the new schema version if the table is successfully created
	 * or upgraded. A failed migration will not update the version, allowing
	 * retries on future plugin loads.
	 *
	 * @return bool True on successful install/upgrade, false on failure.
	 */
	public static function install() {
		if ( ! static::create_table() ) {
			return false;
		}

		update_option( static::DB_VERSION_OPTION, static::DB_VERSION, true );
		return true;
	}

	/**
	 * Create or update the table via dbDelta.
	 *
	 * Runs optional pre-migration hook, executes dbDelta, and verifies the result.
	 * Returns false if the table does not exist after migration (indicating failure).
	 *
	 * @return bool True if table exists after migration, false otherwise.
	 */
	private static function create_table() {
		global $wpdb;

		$table   = static::table_name();
		$charset = $wpdb->get_charset_collate();

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		if ( method_exists( static::class, 'before_table_install' ) && false === static::before_table_install() ) {
			return false;
		}

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- schema DDL; table name from code.
		$sql = "CREATE TABLE {$table} (
			" . static::table_definition() . "
		) {$charset};";

		dbDelta( $sql );

		// Verify the table was created/upgraded successfully.
		$table_exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $table ) ) ) === $table;

		if ( ! $table_exists ) {
			error_log( 'CHEFS table installation failed: table does not exist after dbDelta.' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions -- Log critical migration failure.
			return false;
		}

		if ( method_exists( static::class, 'table_schema_is_ready' ) && ! static::table_schema_is_ready() ) {
			error_log( 'CHEFS table installation failed: expected schema is not ready.' ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions -- Log critical migration failure.
			return false;
		}

		return true;
	}

	/**
	 * Plugin activation callback (single site or network-wide).
	 *
	 * WordPress only passes $network_wide = true on multisite network
	 * activation, so an extra is_multisite() check is unnecessary.
	 *
	 * @param bool $network_wide Whether the plugin is network-activated.
	 * @return void
	 */
	public static function activate( $network_wide ) {
		if ( $network_wide ) {
			static::install_on_sites( static::site_ids_for_network_install() );
			return;
		}

		static::install();
	}

	/**
	 * Create the table for a newly created multisite site.
	 *
	 * @param object $new_site New site object (WP_Site or blog_id carrier).
	 * @return void
	 */
	public static function on_initialize_site( $new_site ) {
		if ( ! is_object( $new_site ) || ! isset( $new_site->blog_id ) ) {
			return;
		}

		static::install_for_blog( (int) $new_site->blog_id );
	}

	/**
	 * Blog IDs to install on during network activation.
	 *
	 * @return int[]
	 */
	public static function site_ids_for_network_install() {
		return \get_sites(
			array(
				'fields' => 'ids',
				'number' => 0,
			)
		);
	}

	/**
	 * Install the table for each site ID (network activation).
	 *
	 * @param int[] $site_ids Blog IDs.
	 * @return void
	 */
	public static function install_on_sites( $site_ids ) {
		foreach ( (array) $site_ids as $site_id ) {
			static::install_for_blog( (int) $site_id );
		}
	}

	/**
	 * Switch to a blog, install, then restore the previous blog.
	 *
	 * @param int $blog_id Blog ID.
	 * @return void
	 */
	public static function install_for_blog( $blog_id ) {
		$can_switch = \function_exists( 'switch_to_blog' ) && \function_exists( 'restore_current_blog' );

		if ( $can_switch ) {
			\switch_to_blog( (int) $blog_id );
		}

		static::install();

		if ( $can_switch ) {
			\restore_current_blog();
		}
	}
}
