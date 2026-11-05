<?php
/**
 * Title: Site Logo
 * Slug: bcew-theme-2/site-logo
 * Inserter: no
 *
 * Renders the BCID logo from the theme's assets directory. Using a PHP pattern
 * lets us resolve the asset URL with get_template_directory_uri() so it works
 * in any environment (template-part HTML files cannot run PHP).
 *
 * @package Bcew\Theme2
 */

$bcew_logo_url = get_template_directory_uri() . '/assets/images/bcid_h_rgb_pos.png';
$bcew_home_url = home_url( '/' );
?>
<!-- wp:image {"width":"180px","height":"auto","sizeSlug":"full","linkDestination":"custom"} -->
<figure class="wp-block-image size-full is-resized"><a href="<?php echo esc_url( $bcew_home_url ); ?>"><img src="<?php echo esc_url( $bcew_logo_url ); ?>" alt="<?php echo esc_attr__( 'Government of British Columbia', 'bc-extended-web-theme' ); ?>" style="width:180px;height:auto" /></a></figure>
<!-- /wp:image -->
