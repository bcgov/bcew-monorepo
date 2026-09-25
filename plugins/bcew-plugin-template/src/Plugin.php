<?php
/**
 * Boots the plugin.
 *
 * @package Bcgov\Bcew\PluginTemplate
 */

namespace Bcgov\Bcew\PluginTemplate;

/**
 * Main plugin class. Call the other classes from here. A new idea uses the file named in the template README.
 */
class Plugin {

	/**
	 * Register hooks that run on every request.
	 */
	public function init() {
		/*
		 * Post types, taxonomies, and meta have to be registered on every
		 * request. WordPress forgets them otherwise, including on the front.
		 */
		( new PostTypes() )->init();
		( new Taxonomies() )->init();
		( new Meta() )->init();

		/*
		 * Admin screens exist only in wp-admin. Skip that class on the front
		 * and on a normal REST request.
		 */
		if ( is_admin() ) {
			( new Admin() )->init();
		}

		/*
		 * Load Rest and Media when their event fires, not on every page view.
		 * Database is not loaded here. Install calls it on activation.
		 */
		add_action(
			'rest_api_init',
			static function () {
				( new Rest() )->register_routes();
			}
		);
		add_action(
			'add_attachment',
			static function ( $attachment_id ) {
				( new Media() )->handle_upload( $attachment_id );
			}
		);
	}

	/**
	 * Runs when an admin activates the plugin.
	 */
	public static function activate() {
		Install::activate();
	}

	/**
	 * Runs when an admin deactivates the plugin.
	 */
	public static function deactivate() {
		Install::deactivate();
	}
}
