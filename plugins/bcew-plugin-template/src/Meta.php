<?php
/**
 * Registers post meta, term meta, and user meta.
 *
 * @package Bcgov\Bcew\PluginTemplate
 */

namespace Bcgov\Bcew\PluginTemplate;

/**
 * Meta fields. Another field is another method in this class.
 */
class Meta {

	/**
	 * Attach meta registration to WordPress init.
	 */
	public function init() {
		/*
		 * Post, term, and user meta are registered on init so the object
		 * types exist first. Another field is another register_meta() call
		 * in register_meta_fields().
		 */
		add_action( 'init', array( $this, 'register_meta_fields' ) );
	}

	/**
	 * Register the plugin's meta fields.
	 */
	public function register_meta_fields() {
	}
}
