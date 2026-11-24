<?php
/**
 * Title: Copyright
 * Slug: bcew-starter-theme/copyright
 * Inserter: no
 *
 * Outputs the footer copyright line with the current year resolved in PHP.
 * Template-part HTML files cannot run PHP, so a pattern supplies the dynamic
 * year (wp_date() respects the site timezone).
 *
 * @package Bcew\StarterTheme
 */

?>
<!-- wp:paragraph {"align":"left"} -->
<p class="has-text-align-left">
    <?php
    printf(
        '&copy;%s %s.',
        esc_html( wp_date( 'Y' ) ),
        esc_attr__( 'Government of British Columbia', 'bcew-starter-theme' )
    );
    ?>
</p>
<!-- /wp:paragraph -->
