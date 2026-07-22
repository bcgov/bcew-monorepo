<?php
/**
 * Plugin Name:       BCEW CHEFS Form
 * Description:       Embed CHEFS forms in WordPress
 * Version:           0.0.1
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            govwordpress@gov.bc.ca
 * License:           Apache-2.0
 * Text Domain:       bcew-chefs-form
 *
 * @package bcew-chefs-form
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BCEW_CHEFS_FORM_PLUGIN_FILE', __FILE__ );
define( 'BCEW_CHEFS_FORM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'BCEW_CHEFS_BASE_URL', 'https://submit.digital.gov.bc.ca/app' );

$local_composer = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $local_composer ) ) {
	require_once $local_composer;
}

if ( ! class_exists( 'Bcgov\\BcewChefsForm\\Credentials' ) ) {
	wp_die( esc_html__( 'BCEW CHEFS Form error: Composer autoload not found. Run composer install in the plugin directory.', 'bcew-chefs-form' ) );
}

register_activation_hook( __FILE__, array( Bcgov\BcewChefsForm\Credentials::class, 'install' ) );
add_action( 'plugins_loaded', array( Bcgov\BcewChefsForm\Credentials::class, 'maybe_install' ) );

/**
 * Initialize the plugin.
 *
 * @return void
 */
function bcew_chefs_form_init() {
	$settings = new Bcgov\BcewChefsForm\Settings();
	$settings->init();

	$rest_api = new Bcgov\BcewChefsForm\RestApi();
	$rest_api->init();

	$block_editor = new Bcgov\BcewChefsForm\BlockEditor();
	$block_editor->init();
}
add_action( 'init', 'bcew_chefs_form_init' );
