<?php
/**
 * Embed configuration for the CHEFS form block.
 *
 * @package bcew-chefs-form
 */

namespace Bcgov\BcewChefsForm;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds the payload the block frontend needs to load CHEFS.
 */
class EmbedConfig {

	/**
	 * @var Gateway
	 */
	private $gateway;

	/**
	 * @param Gateway|null $gateway Gateway client.
	 */
	public function __construct( Gateway $gateway = null ) {
		$this->gateway = $gateway ?? new Gateway();
	}

	/**
	 * @param string $form_id CHEFS form UUID.
	 * @return array{success:bool,formId:?string,authToken:?string,baseUrl:?string,error:?string}
	 */
	public function get( $form_id ) {
		$form_id = Credentials::sanitize_form_id( $form_id );

		if ( '' === $form_id ) {
			return array( 'success' => false, 'error' => __( 'Invalid form ID.', 'bcew-chefs-form' ) );
		}

		$record = Credentials::get_by_form_id( $form_id );

		if ( ! $record ) {
			return array( 'success' => false, 'error' => __( 'Form not configured in CHEFS Forms.', 'bcew-chefs-form' ) );
		}

		$token = $this->gateway->get_token( $record['form_id'], $record['api_key'] );

		if ( empty( $token['token'] ) ) {
			return array( 'success' => false, 'error' => $token['error'] ?? __( 'Could not load the CHEFS form.', 'bcew-chefs-form' ) );
		}

		return array(
			'success'   => true,
			'formId'    => $record['form_id'],
			'authToken' => $token['token'],
			'baseUrl'   => untrailingslashit( BCEW_CHEFS_BASE_URL ),
			'error'     => null,
		);
	}
}
