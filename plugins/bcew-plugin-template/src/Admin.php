<?php
/**
 * Registers wp-admin menus and settings screens.
 *
 * @package Bcgov\Bcew\PluginTemplate
 */

namespace Bcgov\Bcew\PluginTemplate;

/**
 * Admin screens. A second screen is another method in this class.
 */
class Admin {

	/**
	 * Attach admin screens to the WordPress admin menu.
	 */
	public function init() {
		/*
		 * admin_menu runs only in wp-admin, when WordPress is building the
		 * left-hand menu. A second screen is another add_menu_page() call
		 * in register_screens().
		 */
		add_action( 'admin_menu', array( $this, 'register_screens' ) );
	}

	/**
	 * Register the plugin's admin menus and settings screens.
	 */
	public function register_screens() {
	}
}
