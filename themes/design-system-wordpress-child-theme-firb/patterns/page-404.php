<?php
/**
 * Title: 404 Page
 * Slug: design-system-wordpress-child-theme-firb/page-404
 * Categories: page
 *
 * @package Design-System-WordPress-Theme
 */
?>

<!-- wp:group {"tagName":"main","style":{"spacing":{"margin":{"top":"0","bottom":"0"},"blockGap":"var:preset|spacing|30"},"border":{"top":{"color":"var:preset|color|banner-background-dark","width":"2px"},"right":[],"bottom":[],"left":[]}},"layout":{"type":"constrained","contentSize":""}} -->
<main class="wp-block-group"
    style="border-top-color:var(--wp--preset--color--banner-background-dark);border-top-width:2px;margin-top:0;margin-bottom:0">
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"},"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group"
        style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
        <!-- wp:heading {"level":1} -->
        <h1 class="wp-block-heading" id="page-not-found">404 - <strong>This page wandered off</strong></h1>
        <!-- /wp:heading -->

        <!-- wp:columns -->
        <div class="wp-block-columns"><!-- wp:column {"width":"60%"} -->
            <div class="wp-block-column" style="flex-basis:60%">
                <!-- wp:group {"metadata":{"name":"DSWP Paragraph","categories":["text"],"patternName":"core/block/15577"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
                <div class="wp-block-group"
                    style="margin-top:var(--wp--preset--spacing--50);margin-bottom:var(--wp--preset--spacing--50)">
                    <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|50"}},"layout":{"type":"constrained"}} -->
                    <div class="wp-block-group">
                        <!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.7"},"spacing":{"padding":{"top":"0","bottom":"0"}}}} -->
                        <p style="padding-top:0;padding-bottom:0;line-height:1.7"><strong>The page you’re looking for
                                might have been removed, moved, or is temporarily unavailable.</strong></p>
                        <!-- /wp:paragraph -->

                        <!-- wp:paragraph -->
                        <p>We suggest:</p>
                        <!-- /wp:paragraph -->

                        <!-- wp:list {"metadata":{"name":"DSWP Bullet List","categories":["text"],"patternName":"core/block/652"},"className":"wp-block-list","style":{"typography":{"lineHeight":"1.6"},"spacing":{"padding":{"right":"var:preset|spacing|40","left":"var:preset|spacing|60"},"margin":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"}}}} -->
                        <ul style="margin-top:var(--wp--preset--spacing--30);margin-bottom:var(--wp--preset--spacing--30);padding-right:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--60);line-height:1.6"
                            class="wp-block-list">
                            <!-- wp:list-item {"style":{"spacing":{"margin":{"left":"0","bottom":"0.4rem"}},"typography":{"lineHeight":"1.6"}}} -->
                            <li style="margin-bottom:0.4rem;margin-left:0;line-height:1.6">Check that you’ve entered the
                                web URL correctly</li>
                            <!-- /wp:list-item -->

                            <!-- wp:list-item {"style":{"spacing":{"margin":{"left":"0","bottom":"0.4rem"}},"typography":{"lineHeight":"1.6"}}} -->
                            <li style="margin-bottom:0.4rem;margin-left:0;line-height:1.6">Use the menu at the top of
                                the page to browse for the information you want</li>
                            <!-- /wp:list-item -->

                            <!-- wp:list-item {"style":{"spacing":{"margin":{"left":"0","bottom":"0.4rem"}},"typography":{"lineHeight":"1.6"}}} -->
                            <li style="margin-bottom:0.4rem;margin-left:0;line-height:1.6">Go back to the B.C. Farm
                                Industry Review Board <a href="<?php echo esc_url( home_url() ); ?>">home page</a>
                            </li>
                            <!-- /wp:list-item -->

                            <!-- wp:list-item {"style":{"spacing":{"margin":{"left":"0","bottom":"0.4rem"}},"typography":{"lineHeight":"1.6"}}} -->
                            <li style="margin-bottom:0.4rem;margin-left:0;line-height:1.6">Use the Search function at
                                the top of this page</li>
                            <!-- /wp:list-item -->
                        </ul>
                        <!-- /wp:list -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"width":"40%"} -->
            <div class="wp-block-column" style="flex-basis:40%">
                <!-- wp:image {"id":68352,"scale":"cover","sizeSlug":"large","linkDestination":"none","align":"center"} -->
                <figure class="wp-block-image aligncenter size-large"><img
                        src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/images/404-cow.png' ); ?>"
                        alt="" class="wp-image-68352" style="object-fit:cover" /></figure>
                <!-- /wp:image -->
            </div>
            <!-- /wp:column -->
        </div>
        <!-- /wp:columns -->
    </div>
    <!-- /wp:group -->
</main>
<!-- /wp:group -->