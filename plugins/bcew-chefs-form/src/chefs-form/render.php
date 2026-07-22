<?php
/**
 * CHEFS Form block render.
 *
 * @package bcew-chefs-form
 */

use Bcgov\BcewChefsForm\Credentials;

$form_id = Credentials::sanitize_form_id( $attributes['formId'] ?? '' );

if ( '' === $form_id ) {
	if ( current_user_can( 'edit_posts' ) ) {
		echo '<p class="bcew-chefs-form__error">' . esc_html__( 'Select a CHEFS form in the block sidebar.', 'bcew-chefs-form' ) . '</p>';
	}
	return;
}

if ( ! Credentials::get_by_form_id( $form_id ) ) {
	if ( current_user_can( 'edit_posts' ) ) {
		echo '<p class="bcew-chefs-form__error">' . esc_html__( 'Form not configured in CHEFS Forms.', 'bcew-chefs-form' ) . '</p>';
	}
	return;
}
?>
<div <?php echo wp_kses_data( get_block_wrapper_attributes( array( 'class' => 'bcew-chefs-form-block' ) ) ); ?>>
	<div class="bcew-chefs-form__webcomponent" data-bcew-chefs-form-id="<?php echo esc_attr( $form_id ); ?>"></div>
</div>
