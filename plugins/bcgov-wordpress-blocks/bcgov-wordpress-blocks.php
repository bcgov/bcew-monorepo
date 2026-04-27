<?php
/**
 * Plugin Name:       Bcgov WordPress Blocks
 * Plugin URI:        https://github.com/bcgov/bcgov-wordpress-blocks
 * Description:       Plugin containing blocks intended to be used with the Design System WordPress Theme suite of products.
 * Version:           1.0.0
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

add_filter( 'get_block_type_variations', 'custom_cover_variation', 10, 2 );

/**
 * Adds a custom variation for the core/cover block.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations/#registering-block-variations
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations/#block-variation-attributes
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations/#block-variation-template
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-variations/#setting-a-default-block-variation
 *
 * @param array         $variations Existing block variations.
 * @param WP_Block_Type $block_type Block type being filtered.
 * @return array Modified block variations.
 */
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
            'metadata'     => [
                'name' => 'Hero image',
            ],
            'layout'       => [
                'type' => 'constrained',
            ],
            'templateLock' => 'contentOnly',
            'isDark'       => true,
        ],
        'icon'        => 'cover-image',
        'innerBlocks' => [
            // This group sets up a centered layout for the content and adds a name to the block for easier identification in the editor.
            [
                'core/group',
                [
                    'metadata' => [
                        'name' => 'Layout Container to center content and set width',
                    ],
                    'layout'   => [
                        'type'           => 'constrained',
                        'contentSize'    => '468px',
                        'justifyContent' => 'left',
                    ],
                ],
                [
                    // This group is used to create a colored background behind the title, description, and action button.
                    [
                        'core/group',
                        [
                            'metadata' => [
                                'name' => 'Card Container',
                            ],
                            'style'    => [
                                'color'   => [
                                    'background' => ' #013366B2', // dswp-surface-color-background-dark-blue, but with 70% opacity.
                                    'text'       => 'var:preset|color|white',
                                ],
                                'border'  => [
                                    'left'   => [
                                        'width' => '0.5rem',
                                        'color' => 'var:preset|color|accent-primary',
                                        'style' => 'solid',
                                    ],
                                    'radius' => '4px',
                                ],
                                'spacing' => [
                                    'padding' => [
                                        'top'    => '0.5rem',
                                        'right'  => '2rem',
                                        'bottom' => '1rem',
                                        'left'   => '2rem',
                                    ],
                                ],
                            ],
                        ],
                        [
                            [
                                // Could be a Title block to use the post title directly.
                                'core/post-title',
                                [
                                    'metadata'    => [
                                        'name' => 'Title',
                                    ],
                                    'placeholder' => 'Title',
                                    'level'       => 1,
                                    'style'       => [
                                        'spacing' => [
                                            'padding' => [
                                                'top'    => '1.5rem',
                                                'bottom' => '1.5rem',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            [
                                // Could be an Excerpt block to use the post excerpt directly.
                                'core/paragraph',
                                [
                                    'metadata'    => [
                                        'name' => 'Description',
                                    ],
                                    'placeholder' => 'Description. Should be 100 or fewer characters.',
                                    'style'       => [
                                        'spacing'    => [
                                            'padding' => [
                                                'bottom' => '1rem',
                                            ],
                                        ],
                                        'typography' => [
                                            'fontSize'   => '1.125rem',
                                            'lineHeight' => '1.7',
                                        ],

                                    ],
                                ],
                            ],
                            [
                                'core/buttons',
                                [],
                                [
                                    [
                                        'core/button',
                                        [
                                            'className'   => 'is-style-link',
                                            'placeholder' => 'Action',
                                            'metadata'    => [
                                                'name' => 'Action',
                                            ],
                                            'style'       => [
                                                'spacing' => [
                                                    'padding'  => [
                                                        'top'    => 0,
                                                        'right'  => '1.5rem',
                                                        'bottom' => '1rem',
                                                        'left'   => 0,
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ];

    return $variations;
}

/**
 * Register link block style for button.
 *
 * @return void
 */
function custom_register_block_styles() {
    // Use the Link button style from the DSWP theme.
    register_block_style(
        'core/button',
        [
            'name'         => 'link',
            'label'        => __( 'Link', 'themeslug' ),
            'inline_style' => '.wp-block-button.is-style-link > * {
                background: none;
                border: none;
                padding: 0;
                font: inherit;
                cursor: pointer;
                outline: inherit;
                text-decoration: underline;
		    }',
        ]
    );
}

add_action( 'init', 'custom_register_block_styles' );

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
