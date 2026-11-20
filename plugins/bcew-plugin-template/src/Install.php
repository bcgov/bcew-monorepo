<?php
/**
 * Runs when an admin activates or deactivates the plugin.
 *
 * @package Bcgov\Bcew\PluginTemplate
 */

namespace Bcgov\Bcew\PluginTemplate;

/**
 * Activation and deactivation.
 */
class Install {

	/**
	 * Runs when an admin activates the plugin.
	 */
	public static function activate() {
		/*
		 * Activation is the one time the custom tables are created.
		 * Reads and writes stay on Database and run later, per request.
		 */
		Database::create_tables();
	}

	/**
	 * Runs when an admin deactivates the plugin.
	 */
	public static function deactivate() {
	}
}
