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


$form_id      = '12e01efd-9c5f-4e03-82bb-9799b6703cea';//isset( $attributes['formId'] ) ? sanitize_text_field( (string) $attributes['formId'] ) : '';
//$token        = isset( $attributes['token'] ) ? sanitize_text_field( (string) $attributes['token'] ) : '';
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
		<?php else: ?>
		<div class="bcew-chefs-form__mount" aria-live="polite">
			<chefs-form-viewer
				form-id="<?php echo esc_attr( $form_id ); ?>"
				base-url="https://chefs-dev.apps.silver.devops.gov.bc.ca/pr-1966"
				auto-reload-on-submit="false"
			></chefs-form-viewer>
		</div>
	<?php endif; ?>
</div>
