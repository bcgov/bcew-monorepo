<?php
/**
 * Plugin Name:       Bcgov WordPress Blocks
 * Plugin URI:        https://github.com/bcgov/bcgov-wordpress-blocks
 * Description:       Plugin containing blocks intended to be used with the Design System WordPress Theme suite of products.
 * Version:           0.0.1
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Author:            govwordpress@gov.bc.ca
 * License:           Apache Licence version 2.0
 * License URI:       https://www.apache.org/licenses/LICENSE-2.0
 * Text Domain:       bcgov-wordpress-blocks
 *
 * @package bcgov-wordpress-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Enqueues the editor assets for the plugin.
 */
function bcgov_wordpress_blocks_enqueue_editor_assets() {
	$asset_path = __DIR__ . '/dist/index.asset.php';

	if ( ! file_exists( $asset_path ) ) {
		return;
	}

	$asset = require $asset_path;

	wp_enqueue_script(
		'bcgov-wordpress-blocks-editor',
		plugins_url( 'dist/index.js', __FILE__ ),
		$asset['dependencies'],
		$asset['version'],
		true
	);

	wp_set_script_translations(
		'bcgov-wordpress-blocks-editor',
		'bcgov-wordpress-blocks'
	);
}
add_action( 'enqueue_block_editor_assets', 'bcgov_wordpress_blocks_enqueue_editor_assets' );

/**
 * Registers the block(s) metadata from the blocks manifest.
 */
function bcgov_wordpress_blocks_init() {
	wp_register_block_types_from_metadata_collection(
		__DIR__ . '/dist',
		__DIR__ . '/dist/blocks-manifest.php'
	);
}
add_action( 'init', 'bcgov_wordpress_blocks_init' );
