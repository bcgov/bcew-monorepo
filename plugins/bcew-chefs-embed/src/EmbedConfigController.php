<?php
/**
 * CHEFS embed configuration REST endpoint.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST endpoint for retrieving short-lived CHEFS authentication tokens.
 *
 * Registers the public embed configuration route, loads stored credentials,
 * delegates CHEFS authentication to ChefsClient, and returns the token,
 * CHEFS base URL, and confirmation message needed by the embed block.
 */
class EmbedConfigController {
	/**
	 * Register the REST route.
	 *
	 * @return void
	 */
	public static function register_routes() {
		register_rest_route(
			'bcew-chefs-embed/v1',
			'/embed-config',
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( self::class, 'get_config' ),
				// The public block needs this short-lived token to load the form.
				'permission_callback' => '__return_true',
				'args'                => array(
					'formId' => array(
						// The block sends the selected saved Form ID with the request.
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);
	}

	/**
	 * Get CHEFS authentication configuration.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function get_config( \WP_REST_Request $request ) {
		$form_id = $request->get_param( 'formId' );

		// API keys stay server-side; only the saved credential pair is used here.
		$credentials = CredentialsManager::get_by_form_id( $form_id );

		if ( ! $credentials ) {
			return new \WP_Error(
				'chefs_form_not_configured',
				\__( 'Unable to decrypt the configured CHEFS credentials.', 'bcew-chefs-embed' ),
				array(
					'status' => \WP_Http::NOT_FOUND,
				)
			);
		}

		// Reuse the same CHEFS authentication path used when credentials are saved.
		$authentication = ( new ChefsClient() )->authenticate( $credentials['form_id'], $credentials['api_key'] );

		if ( ! $authentication['success'] ) {
			// Do not expose API keys or detailed upstream authentication errors publicly.
			return new \WP_Error(
				'chefs_auth_request_failed',
				\__( 'Unable to contact CHEFS.', 'bcew-chefs-embed' ),
				array(
					'status' => \WP_Http::BAD_GATEWAY,
				)
			);
		}

		if ( empty( $authentication['token'] ) ) {
			return new \WP_Error( 'chefs_invalid_auth_response', \__( 'CHEFS returned an invalid authentication response.', 'bcew-chefs-embed' ), array( 'status' => \WP_Http::BAD_GATEWAY ) );
		}

		// The block needs the token and endpoint; confirmation is optional configuration.
		return \rest_ensure_response(
			array(
				'token'        => $authentication['token'],
				'baseUrl'      => 'https://submit.digital.gov.bc.ca/app',
				'confirmation' => OptionsManager::get_confirmation( $form_id ),
			)
		);
	}
}
