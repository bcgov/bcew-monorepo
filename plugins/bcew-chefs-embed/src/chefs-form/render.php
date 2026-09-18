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

use Bcgov\BcewChefsEmbed\CredentialsManager;
use Bcgov\BcewChefsEmbed\ChefsClient;

$form_id = isset( $attributes['formId'] ) ? sanitize_text_field( (string) $attributes['formId'] ) : '';
$credentials = CredentialsManager::get_by_form_id( $form_id );
$token = ( new ChefsClient() )->authenticate( $form_id, $credentials['api_key'] )['token'] ?? null;

$wrapper_attributes = get_block_wrapper_attributes();
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() is escaped. ?>>
	<?php if ( '' === $form_id ) : ?>
		<p class="bcew-chefs-form__empty">
			<?php esc_html_e( 'No CHEFS form selected.', 'bcew-chefs-embed' ); ?>
		</p>
	<?php else : ?>
        <chefs-form-viewer
            form-id="<?php echo esc_attr( $form_id ); ?>"
            auth-token="<?php echo esc_attr( $token ); ?>"
            base-url="https://submit.digital.gov.bc.ca/app"
            auto-reload-on-submit="false"
        ></chefs-form-viewer>
	<?php endif; ?>
</div>
