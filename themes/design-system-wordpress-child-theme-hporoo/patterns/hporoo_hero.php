<?php
/**
 * Title: HPOROO Hero Image with Title
 * Slug: design-system-wordpress-child-theme-hporoo/hporoo-hero
 * Categories: uncategorized
 *
 * @package Design-System-WordPress-Theme
 */

$hporoo_logo = esc_url(get_stylesheet_directory_uri() . '/assets/images/hero-image.svg');
?>

<!-- wp:cover {"dimRatio":0,"isUserOverlayColor":true,"isDark":false,"style":{"spacing":{"padding":{"top":"0","bottom":"0","left":"0","right":"0"},"margin":{"top":"0","bottom":"0"}},"dimensions":{"aspectRatio":"auto"}},"layout":{"type":"default"}} -->
<div class="wp-block-cover is-light"
    style="margin-top:0;margin-bottom:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;"><span
        aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim"></span>
    <div class="wp-block-cover__inner-container">
        <!-- wp:group {"style":{"background":{"backgroundImage":{"url":"<?php echo $hporoo_logo; ?>","id":53,"source":"file","title":"hero-section"},"backgroundSize":"cover"},"spacing":{"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"default"}} -->
        <div class="wp-block-group">
            <!-- wp:group {"style":{"spacing":{"margin":{"top":"0","bottom":"0"},"padding":{"right":"var:preset|spacing|60","left":"var:preset|spacing|60","top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained","contentSize":"var(--dswp-layout-content-size)"}} -->
            <div class="wp-block-group"
                style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--60);padding-right:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60);padding-left:var(--wp--preset--spacing--60)">
                <!-- wp:group {"layout":{"type":"constrained","contentSize":"29.25rem","justifyContent":"left"}} -->
                <div class="wp-block-group">
                    <!-- wp:group {"className":"has-background-hporoo-tertiary-light-blue-80-background-color","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|50","right":"var:preset|spacing|50"},"margin":{"top":"0","bottom":"0"}},"dimensions":{"minHeight":"15.25rem"},"border":{"radius":"4px","left":{"color":"var:preset|color|primary-hporoo","width":"6px"}}},"backgroundColor":"hporoo-tertiary-light-blue-80","layout":{"type":"default"}} -->
                    <div class="wp-block-group has-background-hporoo-tertiary-light-blue-80-background-color has-hporoo-tertiary-light-blue-80-background-color has-background"
                        style="border-radius:4px;border-left-color:var(--wp--preset--color--primary-hporoo);border-left-width:6px;min-height:15.25rem;margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--40);padding-right:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--40);padding-left:var(--wp--preset--spacing--50)">
                        <!-- wp:heading {"textAlign":"left","style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"fontSize":"large"} -->
                        <h2 class="wp-block-heading has-text-align-left has-large-font-size"
                            style="margin-top:0;margin-bottom:0">Health Professions and Occupations Regulatory Oversight
                            Office
                        </h2>
                        <!-- /wp:heading -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:group -->
    </div>
</div>
<!-- /wp:cover -->