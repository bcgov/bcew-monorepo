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
require_once __DIR__ . '/includes/class-chefs-flow-demo.php';

register_activation_hook( __FILE__, array( 'BCEW_Chefs_Credentials', 'install' ) );

add_action( 'plugins_loaded', array( 'BCEW_Chefs_Credentials', 'maybe_install' ) );

BCEW_Chefs_Settings::init();
BCEW_Chefs_Flow_Demo::init();

add_action( 'init', function () {
	if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		wp_register_block_types_from_metadata_collection( __DIR__ . '/dist', __DIR__ . '/dist/blocks-manifest.php' );
		return;
	}

	foreach ( glob( __DIR__ . '/dist/*/block.json' ) ?: array() as $block_file ) {
		register_block_type_from_metadata( $block_file );
	}
} );

add_action( 'enqueue_block_editor_assets', function () {
	wp_add_inline_script(
		'wp-blocks',
		'window.bcewChefsFormSettings=' . wp_json_encode(
			array(
				'forms'       => BCEW_Chefs_Credentials::list_forms( false ),
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
				$embed_ref = sanitize_key( $request->get_param( 'embed_ref' ) );

				return BCEW_Chefs_Credentials::is_valid_embed_ref( $embed_ref )
					&& null !== BCEW_Chefs_Credentials::get_by_embed_ref( $embed_ref );
			},
			'callback'            => function ( $request ) {
				$embed_ref = sanitize_key( $request->get_param( 'embed_ref' ) );
				$config    = bcew_chefs_form_get_embed_config( $embed_ref );

				if ( class_exists( 'BCEW_Chefs_Flow_Demo' ) ) {
					BCEW_Chefs_Flow_Demo::record_embed( $embed_ref, $config );
				}

				if ( ! $config['success'] ) {
					$config['settingsUrl'] = BCEW_Chefs_Settings::get_page_url();
				}

				return rest_ensure_response( $config );
			},
			'args'                => array(
				'embed_ref' => array(
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_key',
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

	$form_id  = strtolower( trim( $form_id ) );
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
 * @return array{success:bool,formId:?string,authToken:?string,baseUrl:?string,viewerScriptUrl:?string,error:?string}
 */
function bcew_chefs_form_get_embed_config( $embed_ref ) {
	if ( ! BCEW_Chefs_Credentials::is_valid_embed_ref( $embed_ref ) ) {
		return array( 'success' => false, 'error' => __( 'Invalid form reference.', 'bcew-chefs-form' ) );
	}

	$record = BCEW_Chefs_Credentials::get_by_embed_ref( $embed_ref );

	if ( ! $record ) {
		return array( 'success' => false, 'error' => __( 'Form not configured in CHEFS Forms.', 'bcew-chefs-form' ) );
	}

	$token = bcew_chefs_form_get_gateway_token( $record['form_id'], $record['api_key'] );

	if ( empty( $token['token'] ) ) {
		return array( 'success' => false, 'error' => $token['error'] ?? __( 'Could not load the CHEFS form.', 'bcew-chefs-form' ) );
	}

	$base = untrailingslashit( BCEW_CHEFS_BASE_URL );

	return array(
		'success'         => true,
		'formId'          => $record['form_id'],
		'authToken'       => $token['token'],
		'baseUrl'         => $base,
		'viewerScriptUrl' => $base . '/embed/chefs-form-viewer.js',
		'error'           => null,
	);
}
