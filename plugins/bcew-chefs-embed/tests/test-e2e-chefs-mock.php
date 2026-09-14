<?php
/**
 * Integration tests for the CHEFS E2E HTTP mock.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

use Bcgov\BcewChefsEmbed\E2eChefsMock;

/**
 * CHEFS E2E mock response handling.
 */
class E2eChefsMockTest extends \WP_UnitTestCase {

	/**
	 * Unrelated requests continue through the HTTP filter.
	 *
	 * @return void
	 */
	public function test_unrelated_request_is_not_mocked() {
		$pre = array( 'existing' => 'response' );

		$this->assertSame(
			$pre,
			E2eChefsMock::pre_http_request( $pre, array(), 'https://example.com/request' )
		);
	}

	/**
	 * An unknown Form ID returns the CHEFS not-found response.
	 *
	 * @return void
	 */
	public function test_unknown_form_id_returns_not_found() {
		$response = E2eChefsMock::pre_http_request(
			false,
			$this->request_args( 'missing-form', 'any-key' ),
			$this->auth_url( 'missing-form' )
		);

		$this->assertSame( 404, $response['response']['code'] );
		$this->assertSame( array( 'detail' => 'Bad formId' ), json_decode( $response['body'], true ) );
	}

	/**
	 * An invalid API key returns the CHEFS forbidden response.
	 *
	 * @return void
	 */
	public function test_invalid_api_key_returns_forbidden() {
		$response = E2eChefsMock::pre_http_request(
			false,
			$this->request_args( '11111111-1111-4111-8111-111111111111', 'wrong-key' ),
			$this->auth_url( '11111111-1111-4111-8111-111111111111' )
		);

		$this->assertSame( 403, $response['response']['code'] );
		$this->assertSame( array( 'detail' => 'Forbidden' ), json_decode( $response['body'], true ) );
	}

	/**
	 * A known Form ID and API key return a test token.
	 *
	 * @return void
	 */
	public function test_valid_credentials_return_token() {
		$response = E2eChefsMock::pre_http_request(
			false,
			$this->request_args( '11111111-1111-4111-8111-111111111111', 'api-key-one' ),
			$this->auth_url( '11111111-1111-4111-8111-111111111111' )
		);

		$this->assertSame( 200, $response['response']['code'] );
		$this->assertSame( array( 'token' => 'e2e-test-token' ), json_decode( $response['body'], true ) );
	}

	/**
	 * Build the CHEFS authentication URL for a test request.
	 *
	 * @param string $form_id Form ID.
	 * @return string
	 */
	private function auth_url( $form_id ) {
		return 'https://submit.digital.gov.bc.ca/app/gateway/v1/auth/token/forms/' . $form_id;
	}

	/**
	 * Build HTTP arguments containing Basic Auth credentials.
	 *
	 * @param string $form_id Form ID.
	 * @param string $api_key API key.
	 * @return array
	 */
	private function request_args( $form_id, $api_key ) {
		return array(
			'headers' => array(
				'Authorization' => 'Basic ' . base64_encode( $form_id . ':' . $api_key ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Build the Basic Auth fixture header expected by the mock.
			),
		);
	}
}
