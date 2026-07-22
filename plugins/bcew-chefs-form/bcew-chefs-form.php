<?php
/**
 * Plugin Name:       BCEW CHEFS Form
 * Description:       Embed CHEFS forms in WordPress
 * Version:           0.0.1
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            govwordpress@gov.bc.ca
 * License:           Apache-2.0
 * Text Domain:       bcew-chefs-form
 *
 * @package bcew-chefs-form
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BCEW_CHEFS_FORM_PLUGIN_FILE', __FILE__ );
define( 'BCEW_CHEFS_BASE_URL', 'https://submit.digital.gov.bc.ca/app' );

require_once __DIR__ . '/includes/class-chefs-crypto.php';
require_once __DIR__ . '/includes/class-chefs-credentials.php';
require_once __DIR__ . '/includes/class-chefs-settings.php';

register_activation_hook( __FILE__, array( 'BCEW_Chefs_Credentials', 'install' ) );

add_action( 'plugins_loaded', array( 'BCEW_Chefs_Credentials', 'maybe_install' ) );

BCEW_Chefs_Settings::init();

add_action( 'init', function () {
	wp_register_block_types_from_metadata_collection( __DIR__ . '/dist', __DIR__ . '/dist/blocks-manifest.php' );
} );

add_action( 'enqueue_block_editor_assets', function () {
	wp_add_inline_script(
		'wp-blocks',
		'window.bcewChefsFormSettings=' . wp_json_encode(
			array(
				'forms'       => BCEW_Chefs_Credentials::list_forms(),
				'settingsUrl' => BCEW_Chefs_Settings::get_page_url(),
			)
		) . ';',
		'before'
	);
} );

add_action( 'rest_api_init', function () {
	register_rest_route(
		'bcew-chefs/v1',
		'/embed-config',
		array(
			'methods'             => 'GET',
			'permission_callback' => function ( $request ) {
				return BCEW_Chefs_Credentials::exists(
					BCEW_Chefs_Credentials::sanitize_form_id( $request->get_param( 'form_id' ) )
				);
			},
			'callback'            => function ( $request ) {
				$form_id = BCEW_Chefs_Credentials::sanitize_form_id( $request->get_param( 'form_id' ) );
				$config  = bcew_chefs_form_get_embed_config( $form_id );

				if ( ! $config['success'] ) {
					$config['settingsUrl'] = BCEW_Chefs_Settings::get_page_url();
				}

				return rest_ensure_response( $config );
			},
			'args'                => array(
				'form_id' => array(
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => array( 'BCEW_Chefs_Credentials', 'sanitize_form_id' ),
				),
			),
		)
	);
} );

/**
 * @return array{token:?string,error:?string}
 */
function bcew_chefs_form_get_gateway_token( $form_id, $api_key ) {
	if ( empty( $api_key ) ) {
		return array(
			'token' => null,
			'error' => __( 'Add the form API key in CHEFS Forms.', 'bcew-chefs-form' ),
		);
	}

	$form_id  = BCEW_Chefs_Credentials::sanitize_form_id( $form_id );
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

/**
 * @return array{success:bool,formId:?string,authToken:?string,baseUrl:?string,error:?string}
 */
function bcew_chefs_form_get_embed_config( $form_id ) {
	$form_id = BCEW_Chefs_Credentials::sanitize_form_id( $form_id );

	if ( '' === $form_id ) {
		return array( 'success' => false, 'error' => __( 'Invalid form ID.', 'bcew-chefs-form' ) );
	}

	$record = BCEW_Chefs_Credentials::get_by_form_id( $form_id );

	if ( ! $record ) {
		return array( 'success' => false, 'error' => __( 'Form not configured in CHEFS Forms.', 'bcew-chefs-form' ) );
	}

	$token = bcew_chefs_form_get_gateway_token( $record['form_id'], $record['api_key'] );

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
