<?php
/**
 * Frontend markup for the CHEFS Form block.
 *
 * Outputs only the Form ID (no API key or token). The view script fetches a
 * short-lived token from embed-config and mounts the CHEFS web component.
 *
 * @package bcew-chefs-embed
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 *
 * Variables provided by WordPress:
 *     $attributes (array): The block attributes.
 *     $content (string): The block default content.
 *     $block (WP_Block): The block instance.
 */

$form_id = isset( $attributes['formId'] ) ? sanitize_text_field( (string) $attributes['formId'] ) : '';

$wrapper_args = array(
	'class'        => 'bcew-chefs-form',
	'data-form-id' => $form_id,
);

// Some tests load this template directly (without a WP_Block context), so
// fall back to a safe manual wrapper when block supports are unavailable.
if ( isset( $block ) && $block instanceof \WP_Block ) {
	$wrapper_attributes = get_block_wrapper_attributes( $wrapper_args );
} else {
	$wrapper_attributes = sprintf(
		'class="%s" data-form-id="%s"',
		esc_attr( $wrapper_args['class'] ),
		esc_attr( $wrapper_args['data-form-id'] )
	);
}
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() is escaped. ?>>
	<?php if ( '' === $form_id ) : ?>
		<p class="bcew-chefs-form__empty">
			<?php esc_html_e( 'No CHEFS form selected.', 'bcew-chefs-embed' ); ?>
		</p>
	<?php else : ?>
		<div class="bcew-chefs-form__mount" aria-busy="true" aria-live="polite"></div>
	<?php endif; ?>
</div>
