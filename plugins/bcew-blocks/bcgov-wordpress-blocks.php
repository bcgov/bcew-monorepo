<?php
/**
 * Plugin Name:       BCEW Blocks
 * Plugin URI:        https://github.com/bcgov/bcew-monorepo/plugins/bcew-blocks
 * Description:       Plugin containing blocks intended to be used with the Design System WordPress Theme suite of products.
 * Version:           1.0.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            govwordpress@gov.bc.ca
 * License:           Apache Licence version 2.0
 * License URI:       https://www.apache.org/licenses/LICENSE-2.0
 * Text Domain:       bcew-blocks
 *
 * @package bcew-blocks
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

/**
 * Load Composer autoloader and verify required class exists.
 * If the autoloader or the required class is missing, halt plugin execution.
 */
$autoloader_path = __DIR__ . '/vendor/autoload.php';
if ( is_file( $autoloader_path ) ) {
    require_once $autoloader_path;
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
add_action( 'init', 'bcgov_wordpress_blocks_init' );

/**
 * Registers the `bcew-blocks/hideEmptyList` context on `core/list`.
 *
 * Core's `core/list` does not know about our context out of the box, so we add
 * it to its `uses_context` at registration time. This lets a nested list read
 * the flag provided by our wrapper blocks (media-text-layout, icon-text-block)
 * without affecting lists anywhere else on the site.
 *
 * @param array  $args Arguments used to register the block type.
 * @param string $name Block type name including namespace.
 *
 * @return array The (possibly modified) registration arguments.
 */
function bcgov_wordpress_blocks_list_uses_context( $args, $name ) {
    if ( 'core/list' === $name ) {
        $uses_context = isset( $args['uses_context'] ) ? (array) $args['uses_context'] : array();
        if ( ! in_array( 'bcew-blocks/hideEmptyList', $uses_context, true ) ) {
            $uses_context[]       = 'bcew-blocks/hideEmptyList';
            $args['uses_context'] = $uses_context;
        }
    }
    return $args;
}
add_filter( 'register_block_type_args', 'bcgov_wordpress_blocks_list_uses_context', 10, 2 );

/**
 * Hides empty lists nested inside our wrapper blocks from the front end.
 *
 * A `core/list` with no list items (or only blank items) still serialises an
 * empty `<ul>`/`<ol>`, which renders as stray spacing/borders. When such a list
 * has no visible text we render nothing at all.
 *
 * This only acts on lists that receive the `bcew-blocks/hideEmptyList` context
 * from one of our wrapper blocks, so lists elsewhere on the site are left
 * untouched and never silently disappear.
 *
 * @param string   $block_content The rendered list markup.
 * @param WP_Block $instance      The block instance, used to read context.
 *
 * @return string The original markup, or an empty string when the list is empty.
 */
function bcgov_wordpress_blocks_hide_empty_list( $block_content, $instance = null ) {
    if ( ! $instance instanceof WP_Block || empty( $instance->context['bcew-blocks/hideEmptyList'] ) ) {
        return $block_content;
    }
    return '' === trim( wp_strip_all_tags( (string) $block_content ) ) ? '' : $block_content;
}
add_filter( 'render_block_core/list', 'bcgov_wordpress_blocks_hide_empty_list', 10, 2 );
