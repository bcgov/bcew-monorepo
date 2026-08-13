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
 */
class EmbedConfigController {

	/**
	 * CHEFS authentication endpoint.
	 *
	 * @var string
	 */
	private const CHEFS_AUTH_URL = 'https://submit.digital.gov.bc.ca/app/gateway/v1/auth/token/forms/';

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
				'permission_callback' => '__return_true',
				'args'                => array(
					'formId' => array(
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

		$credentials = CredentialsManager::get_by_form_id( $form_id );

		if ( ! $credentials ) {
			$normalized_form_id = trim( sanitize_text_field( $form_id ) );

			if ( in_array( $normalized_form_id, CredentialsManager::get_saved_form_ids(), true ) ) {
				return new \WP_Error(
					'chefs_credentials_error',
					__( 'Unable to decrypt the configured CHEFS credentials.', 'bcew-chefs-embed' ),
					array(
						'status' => \WP_Http::INTERNAL_SERVER_ERROR,
					)
				);
			}
		}

		$api_key = $credentials['api_key'];

		$response = wp_remote_post(
			self::CHEFS_AUTH_URL . rawurlencode( $credentials['form_id'] ),
			array(
				'timeout' => 15,
				'headers' => array(
					// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Required for HTTP Basic auth when exchanging the CHEFS API key for a short-lived token.
					'Authorization' => 'Basic ' . base64_encode(
						$credentials['form_id'] . ':' . $api_key
					),
					'Accept'        => 'application/json',
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return new \WP_Error(
				'chefs_auth_request_failed',
				__( 'Unable to contact CHEFS.', 'bcew-chefs-embed' ),
				array(
					'status' => \WP_Http::BAD_GATEWAY,
				)
			);
		}

		$status = wp_remote_retrieve_response_code( $response );
		$body   = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( $status < 200 || $status >= 300 || ! is_array( $body ) ) {
			return new \WP_Error(
				'chefs_auth_failed',
				__( 'CHEFS authentication failed.', 'bcew-chefs-embed' ),
				array(
					'status' => \WP_Http::BAD_GATEWAY,
				)
			);
		}

		if ( empty( $body['token'] ) ) {
			return new \WP_Error(
				'chefs_invalid_auth_response',
				__( 'CHEFS returned an invalid authentication response.', 'bcew-chefs-embed' ),
				array(
					'status' => \WP_Http::BAD_GATEWAY,
				)
			);
		}

		return rest_ensure_response(
			array(
				'token'   => $body['token'],
				'baseUrl' => 'https://submit.digital.gov.bc.ca/app',
			)
		);
	}
}
