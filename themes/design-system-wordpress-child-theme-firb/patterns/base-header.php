<?php
/**
 * Title: Base Header
 * Slug: design-system-wordpress-child-theme-firb/base-header
 * Categories: header
 *
 * @package Design-System-WordPress-Theme
 */
?>

<!-- wp:group {"align":"full","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull">
    <!-- wp:group {"align":"wide","style":{"spacing":{"blockGap":"0"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
    <div class="wp-block-group alignwide">
        <!-- wp:pattern {"slug":"design-system-wordpress-child-theme-firb/site-logo"} /-->

        <!-- wp:pattern {"slug":"design-system-wordpress-child-theme-firb/navigation-mobile"} /-->

        <!-- wp:wordpress-search/search-bar /-->
    </div>
    <!-- /wp:group -->

    <!-- wp:group {"metadata":{"name":"header"},"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"0","right":"0"},"margin":{"top":"0","bottom":"0"},"blockGap":"0"}},"layout":{"type":"constrained"}} -->
    <div class="wp-block-group alignfull"
        style="margin-top:0;margin-bottom:0;padding-top:var(--wp--preset--spacing--20);padding-right:0;padding-bottom:var(--wp--preset--spacing--20);padding-left:0">
        <!-- wp:group {"tagName":"header","metadata":{"name":"Contents"},"align":"wide","style":{"spacing":{"margin":{"top":"0","bottom":"0"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
        <header class="wp-block-group alignwide" style="margin-top:0;margin-bottom:0">
            <!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
            <div class="wp-block-group">
            
                <!-- wp:pattern {"slug":"design-system-wordpress-child-theme-firb/navigation"} /-->
            
            </div>
            <!-- /wp:group -->
        </header>
        <!-- /wp:group -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->