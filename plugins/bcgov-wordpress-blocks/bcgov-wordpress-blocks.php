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
 * Adds a block variation on the core/cover block to be used as the default variation when inserting a cover block in the editor. This allows us to set custom default attributes for the cover block, such as a custom background color, and to use a custom template for the block variation.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations/#registering-block-variations
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations/#block-variation-attributes
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations/#block-variation-template
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations/#setting-a-default-block-variation
 * @return void
 */
add_filter( 'get_block_type_variations', 'custom_cover_variation', 10, 2 );
function custom_cover_variation( $variations, $block_type ) {
	// Only modify variations for the cover block.
	if ( 'core/cover' !== $block_type->name ) {
		return $variations;
	}

	// Add a custom variation.
	$variations[] = [
		'name'        => 'hero-image',
		'title'       => __( 'Hero Image', 'textdomain' ),
		'description' => __( 'A Hero Image variation on the cover block', 'textdomain' ),
		'scope'       => [ 'inserter' ],
		'isDefault'   => false,
		'attributes'  => [
			'align'              => 'full',
			'layout'             => [
				'type'        => 'constrained',
				'contentSize' => '468px',
			],
		],
		'innerBlocks' => [
			[
				'core/group',
				[
					'layout' => [
						'type'        => 'constrained',
						'contentSize' => '468px',
					],
					'style'  => [
						'color'  => [
							'background' => '#013366B3',
						],
						'border' => [
							'left' => [
								'width' => '0.5rem',
								'color' => '#fcba19',
								'style' => 'solid',
							],
						],
					],
				],
				[
					[ 'core/heading', [ 'level' => 1, 'content' => 'Hero title', 'style' => [ 'color' => [ 'text' => '#ffffff' ] ] ] ],
					[ 'core/paragraph', [ 'content' => 'Hero description', 'style' => [ 'color' => [ 'text' => '#ffffff' ] ] ] ],
					[ 'core/paragraph', [ 'content' => 'Visit <a href="/some-page">another page</a>', 'style' => [ 'color' => [ 'text' => '#ffffff' ] ] ] ],
				],
			],
		],
		'icon' => 'star-filled',
	];

	return $variations;
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
