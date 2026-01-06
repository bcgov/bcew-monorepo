<?php
/**
 * Child theme functions and definitions.
 *
 * @package Design_System_Wordpress_Child_Theme_FIRB
 */

/**
 * Enqueue child theme styles and scripts.
 */
function firb_child_theme_enqueue_styles() {
	// Enqueue taxonomy filter overrides.
	wp_enqueue_style(
		'firb-taxonomy-filter-overrides',
		get_stylesheet_directory_uri() . '/taxonomy-filter-overrides.css',
		array(),
		'1.0.0'
	);
}
add_action( 'wp_enqueue_scripts', 'firb_child_theme_enqueue_styles' );
