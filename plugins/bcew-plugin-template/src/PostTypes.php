<?php
/**
 * Registers custom post types.
 *
 * @package Bcgov\Bcew\PluginTemplate
 */

namespace Bcgov\Bcew\PluginTemplate;

/**
 * Custom post types. A second post type is another method in this class.
 */
class PostTypes {

	/**
	 * Attach post type registration to WordPress init.
	 */
	public function init() {
		/*
		 * WordPress registers content types on init, after the core post
		 * types exist. A second post type is another register_post_type()
		 * call in register_post_types().
		 */
		add_action( 'init', array( $this, 'register_post_types' ) );
	}

	/**
	 * Register the plugin's custom post types.
	 */
	public function register_post_types() {
	}
}
