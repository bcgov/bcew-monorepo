<?php
/**
 * Plugin Name:       bcew-chefs-embed
 * Plugin URI:        https://github.com/bcgov/bcew-monorepo/plugins/bcew-chefs-embed
 * Description:       Embed BC Government Common Hosted Form Service (CHEFS) forms into WordPress pages and posts.
 * Version:           0.0.1
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            govwordpress@gov.bc.ca
 * License:           Apache Licence version 2.0
 * License URI:       https://www.apache.org/licenses/LICENSE-2.0
 * Text Domain:       bcew-chefs-embed
 *
 * @package bcew-chefs-embed
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Bcgov\BcewChefsEmbed\CredentialsManager;

/**
 * Load Composer autoloader and verify required class exists.
 * If the autoloader or the required class is missing, halt plugin execution.
 */
$autoloader_path = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $autoloader_path ) ) {
	require_once $autoloader_path;
}

if ( class_exists( CredentialsManager::class ) ) {
	register_activation_hook( __FILE__, array( CredentialsManager::class, 'activate' ) );
	add_action( 'wp_initialize_site', array( CredentialsManager::class, 'on_initialize_site' ) );
}

/**
 * Registers the block(s) metadata from the `blocks-manifest.php` and registers the block type(s)
 * based on the registered block metadata. Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
 */
function bcew_chefs_embed_init() {
	if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		wp_register_block_types_from_metadata_collection( __DIR__ . '/dist', __DIR__ . '/dist/blocks-manifest.php' );
	} else {
		// Define the path to the build directory.
		$build_dir = plugin_dir_path( __FILE__ ) . 'dist/';

		// Use glob to find all block.json files in the subdirectories of the build folder.
		$block_files = glob( $build_dir . '*/block.json' );
		// Loop through each block.json file.
		foreach ( $block_files as $block_file ) {
			// Register the block type from the metadata in block.json.
			register_block_type_from_metadata( $block_file );
		}
	}
}
add_action( 'init', 'bcew_chefs_embed_init' );
