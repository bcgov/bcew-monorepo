<?php
/**
 * Query Template block.
 *
 * @package bcew-starter-theme/query-template
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

$slug          = sprintf( 'query-template-%s', $block->context['postType'] ?? 'post' );
$template_part = get_block_template(
    sprintf( '%s//%s', get_stylesheet(), $slug ),
    'wp_template_part'
);
if ( ! $template_part ) {
	$slug = 'query-template';
}
$render = sprintf( '<!-- wp:template-part {"slug":"%s"} /-->', esc_attr( $slug ) );
// WordPress shows an example of this in their do_blocks documentation with echo.
//phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo do_blocks( $render );
