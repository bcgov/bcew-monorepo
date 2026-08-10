<?php
/**
 * Plugin Name:       bcew-chefs-embed
 * Plugin URI:        https://github.com/bcgov/bcew-monorepo/plugins/bcew-chefs-embed
 * Description:       Embed BC Government Common Hosted Form Service (CHEFS) forms into WordPress pages and posts.
 * Version:           0.0.1
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            govwordpress@gov.bc.ca
 * License:           Apache Licence version 2.0
 * License URI:       https://www.apache.org/licenses/LICENSE-2.0
 * Text Domain:       bcew-chefs-embed
 *
 * @package bcew-chefs-embed
 */

use Bcgov\BcewChefsEmbed\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Bcgov\BcewChefsEmbed\CredentialsManager;

/**
 * Load Composer autoloader and verify required class exists.
 * If the autoloader or the required class is missing, halt plugin execution.
 */
$autoloader_path = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $autoloader_path ) ) {
	require_once $autoloader_path;
}

if ( class_exists( CredentialsManager::class ) ) {
	register_activation_hook( __FILE__, array( CredentialsManager::class, 'activate' ) );
	add_action( 'wp_initialize_site', array( CredentialsManager::class, 'on_initialize_site' ) );
	add_action( 'rest_api_init', 'bcew_chefs_embed_register_rest_routes' );
}

/**
 * Initialize the CHEFS settings admin page.
 *
 * @return void
 */
function bcew_chefs_embed_admin_init() {
	$settings = new Settings();
	$settings->init();
}

/**
 * Register the CHEFS menu on admin_menu hook.
 *
 * @return void
 */
function bcew_chefs_embed_register_menu() {
	$settings = new Settings();
	$settings->register_menu();
}

/**
 * Register the CHEFS block using the WordPress 6.7 metadata collection pattern.
 *
 * The manifest is a metadata cache for performance. The block still needs its own
 * `register_block_type_from_metadata()` call so WordPress registers its assets and render callback.
 *
 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
 */
function bcew_chefs_embed_init() {
	$build_dir     = __DIR__ . '/dist';
	$manifest_path = $build_dir . '/blocks-manifest.php';

	// Load block metadata from the generated manifest when available.
	if ( function_exists( 'wp_register_block_metadata_collection' ) && file_exists( $manifest_path ) ) {
		wp_register_block_metadata_collection( $build_dir, $manifest_path );
	}

	// Register the actual block from its built metadata directory (when present).
	$block_path = $build_dir . '/chefs-form';
	if ( file_exists( $block_path . '/block.json' ) ) {
		register_block_type_from_metadata( $block_path );
	}
}

// Initialize admin settings (menu, forms, actions).
if ( is_admin() && class_exists( Settings::class ) ) {
	add_action( 'admin_menu', 'bcew_chefs_embed_register_menu' );
	add_action( 'admin_init', 'bcew_chefs_embed_admin_init' );
}

// Initialize blocks and other frontend functionality.
add_action( 'init', 'bcew_chefs_embed_init' );

/**
 * Register plugin REST API routes.
 */
function bcew_chefs_embed_register_rest_routes() {
	register_rest_route(
		'bcew-chefs-embed/v1',
		'/form-ids',
		[
			[
				'methods'             => 'GET',
				'callback'            => 'bcew_chefs_embed_get_saved_form_ids',
				'permission_callback' => 'bcew_chefs_embed_can_edit_posts',
			],
		]
	);
}

/**
 * Return saved CHEFS form IDs from the credentials table.
 *
 * @return WP_REST_Response REST response containing form IDs.
 */
function bcew_chefs_embed_get_saved_form_ids() {
	$form_ids = CredentialsManager::get_saved_form_ids();

	return new WP_REST_Response( $form_ids, 200 );
}

/**
 * Permission callback for REST routes that require edit post capabilities.
 *
 * @return bool|\WP_Error True when current user can edit posts, otherwise error.
 */
function bcew_chefs_embed_can_edit_posts() {
	if ( ! current_user_can( 'edit_posts' ) ) {
		return new \WP_Error(
			'rest_forbidden',
			__( 'You do not have permission to view CHEFS form IDs.', 'bcew-chefs-embed' ),
			array( 'status' => 403 )
		);
	}

	return true;
}
