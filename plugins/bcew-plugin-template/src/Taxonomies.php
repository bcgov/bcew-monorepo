<?php
/**
 * Registers taxonomies.
 *
 * @package Bcgov\Bcew\PluginTemplate
 */

namespace Bcgov\Bcew\PluginTemplate;

/**
 * Taxonomies. A second taxonomy is another method in this class.
 */
class Taxonomies {

	/**
	 * Attach taxonomy registration to WordPress init.
	 */
	public function init() {
		/*
		 * Taxonomies are registered on init, alongside post types, so the
		 * post type they attach to already exists. A second taxonomy is
		 * another register_taxonomy() call in register_taxonomies().
		 */
		add_action( 'init', array( $this, 'register_taxonomies' ) );
	}

	/**
	 * Register the plugin's taxonomies.
	 */
	public function register_taxonomies() {
	}
}
