<?php
/**
 * CHEFS Form block render.
 *
 * @package bcew-chefs-form
 */

$embed_ref = $attributes['embedRef'] ?? '';

if ( ! BCEW_Chefs_Credentials::is_valid_embed_ref( $embed_ref ) ) {
	if ( current_user_can( 'edit_posts' ) ) {
		echo '<p class="bcew-chefs-form__error">' . esc_html__( 'Select a CHEFS form in the block sidebar.', 'bcew-chefs-form' ) . '</p>';
	}
	return;
}

if ( ! BCEW_Chefs_Credentials::get_by_embed_ref( $embed_ref ) ) {
	if ( current_user_can( 'edit_posts' ) ) {
		echo '<p class="bcew-chefs-form__error">' . esc_html__( 'Form not configured in CHEFS Forms.', 'bcew-chefs-form' ) . '</p>';
	}
	return;
}
?>
<div <?php echo wp_kses_data( get_block_wrapper_attributes( array( 'class' => 'bcew-chefs-form-block' ) ) ); ?>>
	<div class="bcew-chefs-form__webcomponent" data-bcew-chefs-embed="<?php echo esc_attr( $embed_ref ); ?>"></div>
</div>
