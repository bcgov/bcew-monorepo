<?php
/**
 * Load the CHEFS mock in the Playwright test WordPress instance only.
 *
 * @package bcew-chefs-embed
 */

use Bcgov\BcewChefsEmbed\CredentialsManager;

if ( defined( 'BCEW_CHEFS_E2E_MOCK' ) && BCEW_CHEFS_E2E_MOCK ) {
	require_once WP_PLUGIN_DIR . '/bcew-chefs-embed/tests/E2eChefsMock.php';
	add_filter( 'pre_http_request', array( \Bcgov\BcewChefsEmbed\E2eChefsMock::class, 'pre_http_request' ), 10, 3 );
	add_action( 'rest_api_init', 'bcew_chefs_embed_e2e_register_routes' );
}

/**
 * Register test-only routes for seeding saved CHEFS forms.
 *
 * @return void
 */
function bcew_chefs_embed_e2e_register_routes() {
	register_rest_route(
		'bcew-chefs-embed-e2e/v1',
		'/forms',
		array(
			array(
				'methods'             => 'POST',
				'callback'            => 'bcew_chefs_embed_e2e_save_form',
				'permission_callback' => 'bcew_chefs_embed_e2e_can_manage',
			),
			array(
				'methods'             => 'DELETE',
				'callback'            => 'bcew_chefs_embed_e2e_delete_forms',
				'permission_callback' => 'bcew_chefs_embed_e2e_can_manage',
			),
		)
	);
}

/**
 * Only administrators may seed forms.
 *
 * @return bool
 */
function bcew_chefs_embed_e2e_can_manage() {
	return current_user_can( 'manage_options' );
}

/**
 * Save a form, optionally with a custom confirmation.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function bcew_chefs_embed_e2e_save_form( WP_REST_Request $request ) {
	$form_id = sanitize_text_field( (string) $request->get_param( 'form_id' ) );

	if ( ! CredentialsManager::save( $form_id, sanitize_text_field( (string) $request->get_param( 'api_key' ) ) ) ) {
		return new WP_REST_Response( array( 'success' => false ), 400 );
	}

	CredentialsManager::save_form_name( $form_id, 'E2E test form' );

	$confirmation = sanitize_textarea_field( (string) $request->get_param( 'confirmation' ) );
	if ( '' !== $confirmation ) {
		CredentialsManager::save_confirmation( $form_id, $confirmation );
	}

	return new WP_REST_Response(
		array(
			'success' => true,
			'form_id' => $form_id,
		),
		200
	);
}

/**
 * Remove every saved form.
 *
 * @return WP_REST_Response
 */
function bcew_chefs_embed_e2e_delete_forms() {
	foreach ( CredentialsManager::list_forms() as $form ) {
		CredentialsManager::delete( $form['form_id'] );
	}

	return new WP_REST_Response( array( 'deleted' => true ), 200 );
}
