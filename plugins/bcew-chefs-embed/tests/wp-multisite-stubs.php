<?php
/**
 * Single-site stubs so InstallsSiteTable network/switch paths are testable.
 *
 * @package bcew-chefs-embed
 */

if ( ! function_exists( 'switch_to_blog' ) ) {
	/**
	 * Record a blog switch for tests when multisite APIs are absent.
	 *
	 * @param int $blog_id Blog ID.
	 * @return true
	 */
	function switch_to_blog( $blog_id ) {
		$GLOBALS['bcew_chefs_embed_switched_blog'] = (int) $blog_id;
		return true;
	}
}

if ( ! function_exists( 'restore_current_blog' ) ) {
	/**
	 * Clear the test blog switch marker.
	 *
	 * @return true
	 */
	function restore_current_blog() {
		unset( $GLOBALS['bcew_chefs_embed_switched_blog'] );
		return true;
	}
}

if ( ! function_exists( 'get_sites' ) ) {
	/**
	 * Return the current blog ID list when multisite APIs are absent.
	 *
	 * @param array $args Query args (unused in stub).
	 * @return int[]
	 */
	function get_sites( $args = array() ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter
		return array( (int) get_current_blog_id() );
	}
}
