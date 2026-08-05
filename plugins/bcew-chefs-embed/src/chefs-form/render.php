<?php
/**
 * Server render template for dynamic (server-rendered) blocks.
 *
 * The following variables are exposed to the file:
 *     $attributes (array): The block attributes.
 *     $content (string): The block default content.
 *     $block (WP_Block): The block instance.
 *
 * @package bcew-chefs-embed
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */
?>
<p <?php echo wp_kses_data( get_block_wrapper_attributes() ); ?>>
    <?php esc_html_e( 'Chefs Form – hello from the dynamic (server-rendered) content!', 'bcew-chefs-embed' ); ?>
</p>
