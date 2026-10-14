<?php
/**
 * Frontend markup for the CHEFS Form block.
 *
 * The token and confirmation are added to the block attributes by the
 * render_block_data hook in bcew-chefs-embed.php. No API key is output.
 *
 * @package bcew-chefs-embed
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 *
 * Variables provided by WordPress:
 *     $attributes (array): The block attributes.
 *     $content (string): The block default content.
 *     $block (WP_Block): The block instance.
 */

$form_id      = isset( $attributes['formId'] ) ? sanitize_text_field( (string) $attributes['formId'] ) : '';
$token        = isset( $attributes['token'] ) ? sanitize_text_field( (string) $attributes['token'] ) : '';
$confirmation = isset( $attributes['confirmation'] ) ? sanitize_textarea_field( (string) $attributes['confirmation'] ) : '';

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'             => 'bcew-chefs-form',
		'data-form-id'      => $form_id,
		'data-confirmation' => $confirmation,
	)
);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() is escaped. ?>>
	<?php if ( '' === $form_id ) : ?>
		<p class="bcew-chefs-form__empty">
			<?php esc_html_e( 'No CHEFS form selected.', 'bcew-chefs-embed' ); ?>
		</p>
	<?php elseif ( '' === $token ) : ?>
		<div class="bcew-chefs-form__error" role="alert">
			<p><?php esc_html_e( 'Unable to load the CHEFS form.', 'bcew-chefs-embed' ); ?></p>
		</div>
	<?php else : ?>
		<div class="bcew-chefs-form__mount" aria-live="polite">
			<chefs-form-viewer
				form-id="<?php echo esc_attr( $form_id ); ?>"
				auth-token="<?php echo esc_attr( $token ); ?>"
				base-url="https://submit.digital.gov.bc.ca/app"
				auto-reload-on-submit="false"
			></chefs-form-viewer>
		</div>
	<?php endif; ?>
</div>
