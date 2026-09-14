<?php
/**
 * CHEFS API client.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Handles requests to the CHEFS authentication endpoint.
 */
class ChefsClient {

    /**
     * CHEFS authentication endpoint.
     *
     * @var string
     */
    private const AUTH_URL = 'https://submit.digital.gov.bc.ca/app/gateway/v1/auth/token/forms/';

    /**
     * Validate credentials and return the short-lived token internally.
     *
     * @param string $form_id Form ID.
     * @param string $api_key API key.
     * @return array{success: true, token: string}|array{success: false, code: string}
     */
    public function authenticate( string $form_id, string $api_key ) {
        $response = \wp_remote_post(
            self::AUTH_URL . rawurlencode( $form_id ),
            array(
                'timeout' => 15,
                'headers' => array(
                    // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Required for HTTP Basic auth.
                    'Authorization' => 'Basic ' . base64_encode( $form_id . ':' . $api_key ),
                    'Accept'        => 'application/json',
                ),
            )
        );

        if ( \is_wp_error( $response ) ) {
            return array(
                'success' => false,
                'code'    => 'request_failed',
            );
        }

        $status                  = \wp_remote_retrieve_response_code( $response );
        $body                    = json_decode( \wp_remote_retrieve_body( $response ), true );
        $is_bad_form_id_response = in_array( $status, array( 400, 404 ), true ) && is_array( $body ) && isset( $body['detail'] ) && is_string( $body['detail'] ) && 0 === strpos( $body['detail'], 'Bad formId' );
        $is_credential_error     = in_array( $status, array( 400, 401, 403, 404 ), true );
        $is_non_success_response = $status < 200 || $status >= 300;
        $is_missing_token        = ! is_array( $body ) || ! isset( $body['token'] ) || ! is_string( $body['token'] ) || '' === $body['token'];

        // CHEFS does not reliably distinguish an invalid Form ID from an invalid API key.
        if ( $is_bad_form_id_response ) {
            $code = 'form_not_found';
        } elseif ( $is_credential_error ) {
            $code = 'invalid_credentials';
        } elseif ( $is_non_success_response ) {
            $code = 'request_failed';
        } elseif ( $is_missing_token ) {
            $code = 'invalid_response';
        } else {
            return array(
                'success' => true,
                'token'   => $body['token'],
            );
        }

        return array(
            'success' => false,
            'code'    => $code,
        );
    }
}
