<?php
/**
 * Shared multisite-aware table install lifecycle.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed;

/**
 * Activation and new-site hooks that call static::install().
 *
 * Used by CredentialsManager and OptionsManager so the network/site
 * bootstrap logic lives in one place.
 */
trait InstallsSiteTable {

	/**
	 * Create or upgrade the table and record the schema version.
	 *
	 * @return void
	 */
	abstract public static function install();

	/**
	 * Plugin activation callback (single site or network-wide).
	 *
	 * @param bool $network_wide Whether the plugin is network-activated.
	 * @return void
	 */
	public static function activate( $network_wide ) {
		if ( \is_multisite() && $network_wide ) {
			$site_ids = \get_sites(
				array(
					'fields' => 'ids',
					'number' => 0,
				)
			);

			static::install_on_sites( $site_ids );
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
		if ( ! \function_exists( 'switch_to_blog' ) ) {
			static::install();
			return;
		}

		\switch_to_blog( (int) $blog_id );
		static::install();
		\restore_current_blog();
	}
}
