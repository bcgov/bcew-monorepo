<?php
/**
 * Title: Site Logo
 * Slug: bcew-starter-theme/site-logo
 * Inserter: no
 *
 * Renders the BCID logo from the theme's assets directory. Using a PHP pattern
 * lets us resolve the asset URL with get_template_directory_uri() so it works
 * in any environment (template-part HTML files cannot run PHP).
 *
 * @package Bcew\StarterTheme
 */

?>
<!-- wp:image {"width":"180px","height":"auto","sizeSlug":"full","linkDestination":"custom", "style":{"spacing":{"margin":{"left":"-1rem"}}}} -->
<figure class="wp-block-image size-full is-resized" style="margin-left:-1rem">
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>">
        <img src="<?php echo esc_url( get_template_directory_uri() . '/assets/images/bcid_h_rgb_pos.png' ); ?>" alt="<?php echo esc_attr__( 'Government of British Columbia', 'bcew-starter-theme' ); ?>" style="width:180px;height:auto" />
    </a>
</figure>
<!-- /wp:image -->
