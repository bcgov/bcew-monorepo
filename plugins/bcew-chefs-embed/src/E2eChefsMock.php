<?php
/**
 * CHEFS E2E HTTP mock.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Provides deterministic CHEFS authentication responses for browser tests.
 *
 * The E2E environment enables this mock through the `pre_http_request` filter
 * so browser tests never contact the live CHEFS service. WordPress calls the
 * filter before sending an HTTP request; returning a response here short-
 * circuits that request, while returning the original `$pre` value leaves
 * unrelated requests unchanged.
 */
class E2eChefsMock {

	/**
	 * Intercept the CHEFS authentication request when it is enabled.
	 *
	 * The real client sends Form ID and API key as HTTP Basic Auth. Decode those
	 * fixture credentials and return the same response shapes that CHEFS would
	 * return for an unknown form, a rejected key, or valid credentials.
	 *
	 * @param mixed  $pre  Existing preempted response.
	 * @param array  $args HTTP request arguments.
	 * @param string $url  Request URL.
	 * @return mixed
	 */
	public static function pre_http_request( $pre, $args, $url ) {
		// Leave unrelated requests untouched; only mock CHEFS credential validation.
		if ( false === strpos( $url, 'submit.digital.gov.bc.ca/app/gateway/v1/auth/token/forms/' ) ) {
			return $pre;
		}

		// Read the same Basic Auth header that ChefsClient sends to CHEFS.
		$authorization = $args['headers']['Authorization'] ?? '';
		// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Decode the Basic Auth fixture header used by the local E2E mock.
		$credentials               = base64_decode( preg_replace( '/^Basic\s+/i', '', $authorization ), true );
		list( $form_id, $api_key ) = array_pad( explode( ':', (string) $credentials, 2 ), 2, '' );
		// Keep browser fixtures in one map so each test can exercise a known form/key pair.
		$valid_credentials = array(
			'11111111-1111-4111-8111-111111111111' => 'api-key-one',
			'22222222-2222-4222-8222-222222222222' => 'api-key-two',
			'33333333-3333-4333-8333-333333333333' => 'persisted-api-key',
			'66666666-6666-4666-8666-666666666666' => 'preview-error-api-key',
			'77777777-7777-4777-8777-777777777777' => 'frontend-test-api-key',
			'88888888-8888-4888-8888-888888888888' => 'frontend-error-api-key',
			'99999999-9999-4999-8999-999999999999' => 'frontend-url-api-key',
			'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff' => 'confirmation-api-key',
			'cccccccc-dddd-4eee-8fff-000000000000' => array( 'original-api-key', 'frontend-custom-api-key' ),
			'cccccccc-dddd-4eee-8fff-111111111111' => 'frontend-error-handler-key',
		);

		if ( ! isset( $valid_credentials[ $form_id ] ) ) {
			// Match CHEFS when the submitted Form ID does not exist.
			return self::response( 'Bad formId', 404, 'Not Found' );
		}

		$valid_api_keys = (array) $valid_credentials[ $form_id ];
		if ( ! in_array( $api_key, $valid_api_keys, true ) ) {
			// Match CHEFS when the Form ID exists but the API key is wrong.
			return self::response( 'Forbidden', 403, 'Forbidden' );
		}

		// A valid fixture returns the short-lived token expected by the client.
		return array(
			'body'     => wp_json_encode( array( 'token' => 'e2e-test-token' ) ),
			'response' => array(
				'code'    => 200,
				'message' => 'OK',
			),
		);
	}

	/**
	 * Build a mocked error response.
	 *
	 * @param string $detail  Response detail.
	 * @param int    $code    HTTP status code.
	 * @param string $message HTTP status message.
	 * @return array
	 */
	private static function response( $detail, $code, $message ) {
		return array(
			'body'     => wp_json_encode( array( 'detail' => $detail ) ),
			'response' => array(
				'code'    => $code,
				'message' => $message,
			),
		);
	}
}
