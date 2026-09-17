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
 * Provides deterministic CHEFS responses for browser tests.
 */
class E2eChefsMock {

    /**
     * Intercept CHEFS authentication and form requests.
     *
     * @param mixed  $pre  Existing preempted response.
     * @param array  $args HTTP request arguments.
     * @param string $url  Request URL.
     * @return mixed
     */
    public static function pre_http_request( $pre, $args, $url ) {
        $is_auth_request = false !== strpos( $url, 'submit.digital.gov.bc.ca/app/gateway/v1/auth/token/forms/' );
        $is_form_request = false !== strpos( $url, 'submit.digital.gov.bc.ca/app/api/v1/forms/' );

        if ( ! $is_auth_request && ! $is_form_request ) {
            return $pre;
        }

        $authorization = $args['headers']['Authorization'] ?? '';
        // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode -- Decode the Basic Auth fixture header used by the local E2E mock.
        $credentials               = base64_decode( preg_replace( '/^Basic\s+/i', '', $authorization ), true );
        list( $form_id, $api_key ) = array_pad( explode( ':', (string) $credentials, 2 ), 2, '' );

        $valid_credentials = [
            '11111111-1111-4111-8111-111111111111' => 'api-key-one',
            '22222222-2222-4222-8222-222222222222' => 'api-key-two',
            '33333333-3333-4333-8333-333333333333' => 'persisted-api-key',
            '66666666-6666-4666-8666-666666666666' => 'preview-error-api-key',
            '77777777-7777-4777-8777-777777777777' => 'frontend-test-api-key',
            '88888888-8888-4888-8888-888888888888' => 'frontend-error-api-key',
            '99999999-9999-4999-8999-999999999999' => 'frontend-url-api-key',
            'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff' => 'confirmation-api-key',
            'cccccccc-dddd-4eee-8fff-000000000000' => [ 'original-api-key', 'frontend-custom-api-key' ],
            'cccccccc-dddd-4eee-8fff-111111111111' => 'frontend-error-handler-key',
        ];

        $form_exists   = isset( $valid_credentials[ $form_id ] );
        $api_key_valid = $form_exists && in_array( $api_key, (array) $valid_credentials[ $form_id ], true );

        if ( ! $form_exists || ! $api_key_valid ) {
            return self::response(
                $form_exists ? 'Forbidden' : 'Bad formId',
                $form_exists ? 403 : 404,
                $form_exists ? 'Forbidden' : 'Not Found'
            );
        }

        if ( $is_form_request ) {
            return [
                'body'     => wp_json_encode(
                    [
                        'title'    => 'E2E test form',
                        'versions' => [
                            [
                                'id'        => 'e2e-test-version',
                                'published' => true,
                            ],
                        ],
                    ]
                ),
                'response' => [
                    'code'    => 200,
                    'message' => 'OK',
                ],
            ];
        }

        return [
            'body'     => wp_json_encode( [ 'token' => 'e2e-test-token' ] ),
            'response' => [
                'code'    => 200,
                'message' => 'OK',
            ],
        ];
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
        return [
            'body'     => wp_json_encode( [ 'detail' => $detail ] ),
            'response' => [
                'code'    => $code,
                'message' => $message,
            ],
        ];
    }
}
