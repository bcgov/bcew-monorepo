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
	// Ensure the credentials table exists even if activation ran before Composer autoload was available.
	add_action( 'plugins_loaded', 'bcew_chefs_embed_maybe_install_credentials_table' );
}

/**
 * Create the credentials table when the schema version is missing or outdated.
 *
 * @return void
 */
function bcew_chefs_embed_maybe_install_credentials_table() {
	if ( ! class_exists( CredentialsManager::class ) ) {
		return;
	}

	if ( get_option( 'bcew_chefs_embed_db_version' ) === CredentialsManager::DB_VERSION ) {
		return;
	}

	CredentialsManager::install();
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
 * Registers the block(s) metadata from the `blocks-manifest.php` and registers the block type(s)
 * based on the registered block metadata. Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
 */
function bcew_chefs_embed_init() {
	if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		wp_register_block_types_from_metadata_collection( __DIR__ . '/dist', __DIR__ . '/dist/blocks-manifest.php' );

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			$registered_block = \WP_Block_Type_Registry::get_instance()->is_registered( 'bcew-chefs-embed/chefs-form' );
			error_log( sprintf( 'bcew-chefs-embed: metadata collection registration complete; chefs-form registered=%s', $registered_block ? 'yes' : 'no' ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}
	} else {
		// Define the path to the build directory.
		$build_dir = plugin_dir_path( __FILE__ ) . 'dist/';

		// Use glob to find all block.json files in the subdirectories of the build folder.
		$block_files = glob( $build_dir . '*/block.json' );
		$block_files = false === $block_files ? array() : $block_files;

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			error_log( sprintf( 'bcew-chefs-embed: found %d block metadata file(s) in %s', count( $block_files ), $build_dir ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}

		// Loop through each block.json file.
		foreach ( $block_files as $block_file ) {
			// Register the block type from the metadata in block.json.
			register_block_type_from_metadata( $block_file );

			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				error_log( sprintf( 'bcew-chefs-embed: registered block metadata from %s', $block_file ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			}
		}

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			$registered_block = \WP_Block_Type_Registry::get_instance()->is_registered( 'bcew-chefs-embed/chefs-form' );
			error_log( sprintf( 'bcew-chefs-embed: fallback registration complete; chefs-form registered=%s', $registered_block ? 'yes' : 'no' ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		}
	}

	bcew_chefs_embed_register_editor_settings();
}

// Initialize admin settings (menu, forms, actions).
if ( is_admin() && class_exists( Settings::class ) ) {
	add_action( 'admin_menu', 'bcew_chefs_embed_register_menu' );
	add_action( 'admin_init', 'bcew_chefs_embed_admin_init' );
}

// Initialize blocks and other frontend functionality.
add_action( 'init', 'bcew_chefs_embed_init' );

/**
 * Bridge editor-only settings into the CHEFS Form block script.
 *
 * @return void
 */
function bcew_chefs_embed_register_editor_settings() {
	// Skip if the admin settings class is unavailable; no settings URL can be generated.
	if ( ! class_exists( Settings::class ) ) {
		return;
	}

	// Resolve the registered block type so we can discover its editor script handle.
	$block_type = \WP_Block_Type_Registry::get_instance()->get_registered( 'bcew-chefs-embed/chefs-form' );

	// If the block is not registered yet or has no editor script, there is nothing to attach.
	if ( ! $block_type || empty( $block_type->editor_script_handles ) ) {
		return;
	}

	// Use the block's first editor script handle as the inline script target.
	$editor_script_handle = reset( $block_type->editor_script_handles );

	if ( ! is_string( $editor_script_handle ) || '' === $editor_script_handle ) {
		return;
	}

	// Inject a small JS config object before the editor script runs.
	// The block editor reads this URL to build the "Open CHEFS settings" empty-state link.
	wp_add_inline_script(
		$editor_script_handle,
		'window.bcewChefsEmbedSettings = ' . wp_json_encode(
			array(
				'settingsUrl' => Settings::get_page_url(),
			)
		) . ';',
		'before'
	);
}

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
