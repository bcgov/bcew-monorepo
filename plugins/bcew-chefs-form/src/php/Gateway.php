<?php
/**
 * CHEFS gateway API client.
 *
 * @package bcew-chefs-form
 */

namespace Bcgov\BcewChefsForm;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Exchanges form credentials for short-lived CHEFS auth tokens.
 */
class Gateway {

	/**
	 * Request a gateway token from CHEFS.
	 *
	 * @param string $form_id CHEFS form UUID.
	 * @param string $api_key Form API key.
	 * @return array{token:?string,error:?string}
	 */
	public function get_token( $form_id, $api_key ) {
		if ( empty( $api_key ) ) {
			return array(
				'token' => null,
				'error' => __( 'Add the form API key in CHEFS Forms.', 'bcew-chefs-form' ),
			);
		}

		$form_id  = Credentials::sanitize_form_id( $form_id );
		$response = wp_remote_post(
			untrailingslashit( BCEW_CHEFS_BASE_URL ) . '/gateway/v1/auth/token/forms/' . rawurlencode( $form_id ),
			array(
				'headers' => array(
					'Authorization' => 'Basic ' . base64_encode( $form_id . ':' . trim( $api_key ) ),
					'Content-Type'  => 'application/json',
				),
				'timeout' => 15,
			)
		);

		if ( is_wp_error( $response ) ) {
			return array( 'token' => null, 'error' => $response->get_error_message() );
		}

		$body = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( 201 !== (int) wp_remote_retrieve_response_code( $response ) || empty( $body['token'] ) ) {
			return array(
				'token' => null,
				'error' => __( 'CHEFS rejected the credentials.', 'bcew-chefs-form' ),
			);
		}

		return array( 'token' => $body['token'], 'error' => null );
	}
}
