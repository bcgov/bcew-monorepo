<?php
/**
 * Plugin Name:       BCEW Plugin Template
 * Plugin URI:        https://github.com/bcgov/bcew-monorepo/plugins/bcew-plugin-template
 * Description:       Reusable OOP plugin skeleton. Main file boots Plugin::init() only.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            govwordpress@gov.bc.ca
 * License:           Apache-2.0
 * License URI:       https://www.apache.org/licenses/LICENSE-2.0
 * Text Domain:       bcew-plugin-template
 * Domain Path:       /languages
 *
 * @package Bcgov\Bcew\PluginTemplate
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BCEW_PLUGIN_TEMPLATE_FILE', __FILE__ );
define( 'BCEW_PLUGIN_TEMPLATE_DIR', plugin_dir_path( __FILE__ ) );
define( 'BCEW_PLUGIN_TEMPLATE_URL', plugin_dir_url( __FILE__ ) );
define( 'BCEW_PLUGIN_TEMPLATE_VERSION', '0.1.0' );

/*
 * Load plugin classes from src/. Composer autoload is used when vendor/
 * exists. Otherwise a small loader maps the plugin namespace onto src/.
 */
$bcew_plugin_template_autoload = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $bcew_plugin_template_autoload ) ) {
	require_once $bcew_plugin_template_autoload;
} else {
	spl_autoload_register(
		static function ( $class ) {
			$prefix = 'Bcgov\\Bcew\\PluginTemplate\\';
			if ( 0 !== strpos( $class, $prefix ) ) {
				return;
			}

			$relative = substr( $class, strlen( $prefix ) );
			$path     = __DIR__ . '/src/' . str_replace( '\\', '/', $relative ) . '.php';

			if ( is_readable( $path ) ) {
				require_once $path;
			}
		}
	);
}

use Bcgov\Bcew\PluginTemplate\Plugin;
use Bcgov\Bcew\PluginTemplate\Support\Activator;
use Bcgov\Bcew\PluginTemplate\Support\Deactivator;

if ( ! class_exists( Plugin::class ) ) {
	return;
}

register_activation_hook( __FILE__, array( Activator::class, 'activate' ) );
register_deactivation_hook( __FILE__, array( Deactivator::class, 'deactivate' ) );
add_action( 'wp_initialize_site', array( Activator::class, 'on_initialize_site' ) );

/**
 * Boot the plugin. This file must only wire the main Plugin class.
 */
function bcew_plugin_template_boot() {
	$plugin = Plugin::instance();
	$plugin->init();
}
add_action( 'plugins_loaded', 'bcew_plugin_template_boot' );
