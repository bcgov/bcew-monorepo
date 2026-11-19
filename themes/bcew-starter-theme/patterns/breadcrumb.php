<?php
/**
 * Title: Breadcrumb
 * Slug: bcew-starter-theme/breadcrumb
 * Inserter: no
 *
 * @package Bcew\StarterTheme
 */
require_once ABSPATH . 'wp-admin/includes/plugin.php';
if ( is_plugin_active( 'bcew-plugin/bcew-plugin.php' ) ) :
	?>
<!-- wp:group {"align":"full","style":{"border":{"bottom":{"width":"1px"},"top":[],"right":[],"left":[]},"spacing":{"padding":{"right":"var:preset|spacing|50","left":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<div
    class="wp-block-group alignfull"
    style="border-bottom-width: 1px; padding-right: var(--wp--preset--spacing--50); padding-left: var(--wp--preset--spacing--50)"
    ><!-- wp:design-system-wordpress-plugin/breadcrumb /--></div
>
<!-- /wp:group -->
	<?php
 endif;
