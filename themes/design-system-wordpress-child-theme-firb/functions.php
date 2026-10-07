<?php
/**
 * Child theme functions and definitions.
 *
 * @package Design_System_Wordpress_Child_Theme_FIRB
 */

/**
 * FIRB opts in to displaying legacy archived block patterns.
 *
 * Keep this child-theme filter while FIRB requires access to legacy patterns.
 */
add_filter( 'dswp_legacy_pattern_allow', '__return_true', 100 );
