<?php
/**
 * Title: Hero Banner
 * Slug: design-system-wordpress-child-theme-firb/hero-banner
 * Categories: header
 *
 * @package Design-System-WordPress-Theme
 */
?>

<!-- wp:group {"metadata":{"categories":["banners"],"patternName":"design-system-wordpress-theme/dswp-secondary-hero-image-with-title","name":"DSWP Secondary Hero Image With Title"},"className":"dswp-secondary-hero-image-with-title","style":{"spacing":{"margin":{"top":"0","bottom":"var:preset|spacing|20"},"padding":{"top":"0","bottom":"var:preset|spacing|30"}}},"backgroundColor":"drk-green","layout":{"type":"constrained"}} -->
<div class="wp-block-group dswp-secondary-hero-image-with-title has-drk-green-background-color has-background"
    style="margin-top:0;margin-bottom:var(--wp--preset--spacing--20);padding-top:0;padding-bottom:var(--wp--preset--spacing--30)">
    <!-- wp:columns {"style":{"spacing":{"padding":{"right":"0","left":"0","top":"0","bottom":"0"},"margin":{"top":"0","bottom":"0"}}}} -->
    <div class="wp-block-columns"
        style="margin-top:0;margin-bottom:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0">
        <!-- wp:column {"verticalAlignment":"center","width":"85%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:85%">
            <!-- wp:group {"style":{"spacing":{"padding":{"left":"var:preset|spacing|30","right":"var:preset|spacing|30"}}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
            <div class="wp-block-group"
                style="padding-right:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30)">
                <!-- wp:post-title {"style":{"elements":{"link":{"color":{"text":"var:preset|color|background-white"}}}},"textColor":"background-white","fontSize":"large"} /-->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"center","width":"85%"} -->
        <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:85%"></div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->