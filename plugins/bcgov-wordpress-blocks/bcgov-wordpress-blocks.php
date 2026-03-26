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
 * Registers the block(s) metadata from the `blocks-manifest.php` and registers the block type(s)
 * based on the registered block metadata. Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
 */
function bcgov_wordpress_blocks_init() {
    wp_register_block_types_from_metadata_collection( __DIR__ . '/dist', __DIR__ . '/dist/blocks-manifest.php' );
}
add_action( 'init', 'bcgov_wordpress_blocks_init' );
