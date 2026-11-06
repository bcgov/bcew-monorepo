<?php
/**
 * Registers /wp-json/ routes.
 *
 * @package Bcgov\Bcew\PluginTemplate
 */

namespace Bcgov\Bcew\PluginTemplate;

/**
 * REST routes. A second route is another method in this class.
 */
class Rest {

	/**
	 * Register the plugin's REST routes.
	 *
	 * Plugin calls this from rest_api_init, so this file is not loaded on a normal page view.
	 */
	public function register_routes() {
	}
}
