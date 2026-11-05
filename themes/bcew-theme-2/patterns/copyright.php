<?php
/**
 * Title: Copyright
 * Slug: bcew-theme-2/copyright
 * Inserter: no
 *
 * Outputs the footer copyright line with the current year resolved in PHP.
 * Template-part HTML files cannot run PHP, so a pattern supplies the dynamic
 * year (wp_date() respects the site timezone).
 *
 * @package Bcew\Theme2
 */

?>
<!-- wp:paragraph {"align":"left","textColor":"text-color"} -->
<p class="has-text-align-left has-text-color-color has-text-color">&copy; <?php echo esc_html( wp_date( 'Y' ) ); ?> Government of British Columbia.</p>
<!-- /wp:paragraph -->
