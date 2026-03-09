<?php
/**
 * Title: Base Footer
 * Slug: design-system-wordpress-child-theme-hporoo/footer
 * Categories: footer
 *
 * @package Design-System-WordPress-Theme
 */
?>

<!-- wp:group {"style":{"spacing":{"padding":{"top":"0","bottom":"var:preset|spacing|50"}},"border":{"top":{"color":"#1fbaaa","width":"1px"}},"color":{"background":"#faf9f8"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-background"
    style="border-top-color:#1fbaaa;border-top-width:1px;background-color:#faf9f8;padding-top:0;padding-bottom:var(--wp--preset--spacing--50)">
    <!-- wp:columns {"style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70","left":"0","right":"var:preset|spacing|20"},"blockGap":{"top":"var:preset|spacing|60"}}}} -->
    <div class="wp-block-columns"
        style="padding-top:var(--wp--preset--spacing--70);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--70);padding-left:0">
        <!-- wp:column {"width":"44.45%","style":{"spacing":{"blockGap":"var:preset|spacing|40"}}} -->
        <div class="wp-block-column" style="flex-basis:44.45%">
            <!-- wp:image {"id":1954,"sizeSlug":"full","linkDestination":"none"} -->
            <figure class="wp-block-image size-full"><img
                    src="<?php echo esc_url(get_stylesheet_directory_uri() . '/assets/images/hporoo-logo.svg'); ?>"
                    alt="" class="wp-image-1954" /></figure>
            <!-- /wp:image -->

            <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"},"color":{"text":"#2d2d2d"},"elements":{"link":{"color":{"text":"#2d2d2d"}}}},"fontFamily":"bcsans"} -->
            <p class="has-text-color has-link-color has-bcsans-font-family" style="color:#2d2d2d;font-size:14px">We
                uphold public safety in the delivery of health care in B.C. by providing oversight of health regulatory
                colleges, conducting investigations, determining disciplinary actions and recommending improvements</p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"33.33%"} -->
        <div class="wp-block-column" style="flex-basis:33.33%"></div>
        <!-- /wp:column -->

        <!-- wp:column {"verticalAlignment":"bottom","width":"25%"} -->
        <div class="wp-block-column is-vertically-aligned-bottom" style="flex-basis:25%">
            <!-- wp:group {"className":"footer-more-info"} -->
            <div class="wp-block-group footer-more-info">
                <!-- wp:heading {"level":6,"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|40","top":"0"}}},"fontSize":"small"} -->
                <h6 class="wp-block-heading has-small-font-size"
                    style="margin-top:0;margin-bottom:var(--wp--preset--spacing--40)">MORE INFO</h6>
                <!-- /wp:heading -->

                <!-- wp:columns {"isStackedOnMobile":false,"style":{"spacing":{"blockGap":{"top":"0"}}}} -->
                <div class="wp-block-columns is-not-stacked-on-mobile">
                    <!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}}} -->
                    <div class="wp-block-column"><!-- wp:paragraph {"fontSize":"small"} -->
                        <p class="has-small-font-size"><a href="/home">Home</a></p>
                        <!-- /wp:paragraph -->

                        <!-- wp:paragraph {"fontSize":"small"} -->
                        <p class="has-small-font-size"><a href="/about">About us</a></p>
                        <!-- /wp:paragraph -->

                        <!-- wp:paragraph {"fontSize":"small"} -->
                        <p class="has-small-font-size"><a href="/board-appointments">Board appointments</a></p>
                        <!-- /wp:paragraph -->

                        <!-- wp:paragraph {"fontSize":"small"} -->
                        <p class="has-small-font-size"><a href="/complaint">Make a complaint</a></p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:column -->

                    <!-- wp:column {"style":{"spacing":{"blockGap":"var:preset|spacing|30"}}} -->
                    <div class="wp-block-column"><!-- wp:paragraph {"fontSize":"small"} -->
                        <p class="has-small-font-size"><a href="/publications">Publications</a></p>
                        <!-- /wp:paragraph -->

                        <!-- wp:paragraph {"fontSize":"small"} -->
                        <p class="has-small-font-size"><a href="/contact">Contact us</a></p>
                        <!-- /wp:paragraph -->

                        <!-- wp:paragraph {"fontSize":"small"} -->
                        <p class="has-small-font-size"><a href="/discipline-tribunal">Discipline Tribunal</a></p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:column -->
                </div>
                <!-- /wp:columns -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->

    <!-- wp:separator -->
    <hr class="wp-block-separator has-alpha-channel-opacity" />
    <!-- /wp:separator -->

    <!-- wp:paragraph {"style":{"typography":{"fontSize":"14px"},"spacing":{"margin":{"top":"var:preset|spacing|40","bottom":"0"}}}} -->
    <p style="margin-top:var(--wp--preset--spacing--40);margin-bottom:0;font-size:14px">© {YYYY} Health Professions and
        Occupations Regulatory Oversight Office</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->