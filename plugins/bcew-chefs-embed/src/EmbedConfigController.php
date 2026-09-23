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
					'formId'     => array(
						// The block sends the selected saved Form ID with the request.
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
					/* ==== TEMP (DSWP-1267) START — DELETE THIS ARG BEFORE MERGE ==== */
					'forceError' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_key',
					),
					/* ==== TEMP (DSWP-1267) END ==== */
				),
			)
		);
	}

	/* ==== TEMP (DSWP-1267) START — DELETE THIS WHOLE METHOD BEFORE MERGE ==== */
	/**
	 * When WP_DEBUG is on, return a chosen public error so load messages can
	 * be checked without breaking real CHEFS credentials.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_Error|null Error when a known forceError was requested.
	 */
	private static function maybe_forced_public_error( \WP_REST_Request $request ) {
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return null;
		}

		$code = $request->get_param( 'forceError' );
		if ( ! is_string( $code ) || '' === $code ) {
			return null;
		}

		$map = array(
			'chefs_form_not_configured' => array(
				'message' => __( 'Unable to decrypt the configured CHEFS credentials.', 'bcew-chefs-embed' ),
				'status'  => \WP_Http::NOT_FOUND,
			),
			'chefs_form_not_found'      => array(
				'message' => __( 'CHEFS could not find this form.', 'bcew-chefs-embed' ),
				'status'  => \WP_Http::NOT_FOUND,
			),
			'chefs_api_key_invalid'     => array(
				'message' => __( 'CHEFS rejected the API key.', 'bcew-chefs-embed' ),
				'status'  => \WP_Http::FORBIDDEN,
			),
			'chefs_unavailable'         => array(
				'message' => __( 'Unable to contact CHEFS. Try again later.', 'bcew-chefs-embed' ),
				'status'  => \WP_Http::BAD_GATEWAY,
			),
			'chefs_form_unavailable'    => array(
				'message' => __( 'The configured CHEFS credentials could not be verified.', 'bcew-chefs-embed' ),
				'status'  => \WP_Http::BAD_GATEWAY,
			),
		);

		if ( ! isset( $map[ $code ] ) ) {
			return null;
		}

		return new \WP_Error(
			$code,
			$map[ $code ]['message'],
			array(
				'status' => $map[ $code ]['status'],
			)
		);
	}
	/* ==== TEMP (DSWP-1267) END ==== */

	/**
	 * Get CHEFS authentication configuration.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function get_config( \WP_REST_Request $request ) {
		/* ==== TEMP (DSWP-1267) START — DELETE THIS BLOCK BEFORE MERGE ==== */
		$forced = self::maybe_forced_public_error( $request );
		if ( $forced instanceof \WP_Error ) {
			return $forced;
		}
		/* ==== TEMP (DSWP-1267) END ==== */

		$form_id = $request->get_param( 'formId' );

		// API keys stay server-side; only the saved credential pair is used here.
		$credentials = CredentialsManager::get_by_form_id( $form_id );

		/*
		 * No saved Form ID / API key in WordPress. This is distinct from a
		 * CHEFS "form not found" response so the public page can tell the
		 * visitor to reconnect the form under CHEFS Forms.
		 */
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
			/*
			 * Map ChefsClient failure codes to stable public error codes.
			 * The block frontend shows a clear visitor message for each code.
			 * Do not expose API keys or raw upstream CHEFS details here.
			 */
			switch ( $authentication['code'] ) {
				case 'form_not_found':
					return new \WP_Error(
						'chefs_form_not_found',
						__( 'CHEFS could not find this form.', 'bcew-chefs-embed' ),
						array(
							'status' => \WP_Http::NOT_FOUND,
						)
					);
				case 'invalid_credentials':
					return new \WP_Error(
						'chefs_api_key_invalid',
						__( 'CHEFS rejected the API key.', 'bcew-chefs-embed' ),
						array(
							'status' => \WP_Http::FORBIDDEN,
						)
					);
				case 'request_failed':
					return new \WP_Error(
						'chefs_unavailable',
						__( 'Unable to contact CHEFS. Try again later.', 'bcew-chefs-embed' ),
						array(
							'status' => \WP_Http::BAD_GATEWAY,
						)
					);
				default:
					return new \WP_Error(
						'chefs_form_unavailable',
						__( 'The configured CHEFS credentials could not be verified.', 'bcew-chefs-embed' ),
						array(
							'status' => \WP_Http::BAD_GATEWAY,
						)
					);
			}
		}

		if ( empty( $authentication['token'] ) ) {
			return new \WP_Error(
				'chefs_form_unavailable',
				\__( 'CHEFS returned an invalid authentication response.', 'bcew-chefs-embed' ),
				array(
					'status' => \WP_Http::BAD_GATEWAY,
				)
			);
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
