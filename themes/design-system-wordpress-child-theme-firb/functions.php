<?php
/**
 * Child theme functions and definitions.
 *
 * @package Design_System_Wordpress_Child_Theme_FIRB
 */

/**
 * Fallback: allow legacy archived block patterns until dependent child themes opt in explicitly.
 *
 * Priority 100 runs late so child themes can override with a higher priority (e.g. 110).
 *
 * Remove this filter once the firb, hporoo, and ticorp child themes have added their own
 * `dswp_legacy_pattern_allow` handling.
 */
add_filter( 'dswp_legacy_pattern_allow', '__return_true', 10 );
