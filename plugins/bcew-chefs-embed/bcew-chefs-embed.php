<?php
/**
 * Plugin Name:       BCEW CHEFS Embed
 * Plugin URI:        https://github.com/bcgov/bcew-monorepo/plugins/bcew-chefs-embed
 * Documentation URI: https://bcgov.github.io/bcew-monorepo/docs/content/plugins/bcew-chefs-embed/
 * Description:       Embed BC Government Common Hosted Form Service (CHEFS) forms into WordPress pages and posts.
 * Version:           1.0.0-alpha.2
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

use Bcgov\BcewChefsEmbed\ChefsClient;
use Bcgov\BcewChefsEmbed\CredentialsManager;

const BCEW_CHEFS_EMBED_BLOCK_NAME = 'bcew-chefs-embed/chefs-form';
const BCEW_CHEFS_EMBED_GOV_ORIGIN = '*.gov.bc.ca';

/**
 * Load Composer autoloader when present.
 */
$autoloader_path = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $autoloader_path ) ) {
	require_once $autoloader_path;
}

register_activation_hook( __FILE__, array( CredentialsManager::class, 'activate' ) );
add_action( 'wp_initialize_site', array( CredentialsManager::class, 'on_initialize_site' ) );
add_action( 'rest_api_init', 'bcew_chefs_embed_register_rest_routes' );
// Ensure the credentials table exists even if activation ran before Composer autoload was available.
add_action( 'plugins_loaded', 'bcew_chefs_embed_maybe_install_credentials_table' );

// Add CHEFS resource origins to an existing Content Security Policy header.
add_filter( 'wp_headers', 'bcew_chefs_embed_extend_csp_header', 1000 );

/**
 * Origins CHEFS needs, keyed by the CSP directive that must allow them.
 *
 * @return array<string, string[]>
 */
function bcew_chefs_embed_csp_sources() {
	$styles = array( BCEW_CHEFS_EMBED_GOV_ORIGIN, 'cdn.form.io', 'fonts.googleapis.com' );

	return array(
		'script-src'      => array( 'cdn.form.io' ),
		'script-src-elem' => array( 'cdn.form.io' ),
		'style-src'       => $styles,
		'style-src-elem'  => $styles,
		'font-src'        => array( BCEW_CHEFS_EMBED_GOV_ORIGIN ),
	);
}

/**
 * Split a CSP directive into its name and source list.
 *
 * @param string $directive Single directive, e.g. "script-src 'self'".
 * @return array{0: string, 1: string[]}
 */
function bcew_chefs_embed_parse_csp_directive( $directive ) {
	$parts = preg_split( '/\s+/', trim( $directive ) );
	$name  = array_shift( $parts );

	return array( $name, $parts );
}

/**
 * Add CHEFS resource origins to an existing Content Security Policy header.
 *
 * Directive names are matched exactly so attribute directives such as
 * script-src-attr are never rewritten.
 *
 * @param array $headers Response headers.
 * @return array
 */
function bcew_chefs_embed_extend_csp_header( $headers ) {
	if ( empty( $headers['Content-Security-Policy'] ) ) {
		return $headers;
	}

	$sources         = bcew_chefs_embed_csp_sources();
	$found           = array();
	$default_sources = array();
	$policy          = explode( ';', $headers['Content-Security-Policy'] );

	foreach ( $policy as &$directive ) {
		list( $name, $parts ) = bcew_chefs_embed_parse_csp_directive( $directive );

		if ( 'default-src' === $name ) {
			$default_sources = $parts;
		}

		if ( isset( $sources[ $name ] ) ) {
			$found[ $name ] = true;
			$directive      = implode( ' ', array_merge( array( $name ), array_unique( array_merge( $parts, $sources[ $name ] ) ) ) );
		}
	}
	unset( $directive );

	// A missing directive falls back to default-src, so copy those sources before adding ours.
	// Without a default-src nothing is restricted, so we must not introduce a restriction.
	if ( ! empty( $default_sources ) ) {
		$inherited = array_diff( $default_sources, array( "'none'" ) );

		foreach ( array( 'script-src', 'style-src', 'font-src' ) as $name ) {
			if ( ! isset( $found[ $name ] ) ) {
				$policy[] = $name . ' ' . implode( ' ', array_unique( array_merge( $inherited, $sources[ $name ] ) ) );
			}
		}
	}

	$headers['Content-Security-Policy'] = implode( ';', $policy );

	return $headers;
}

add_filter( 'render_block_data', 'bcew_chefs_embed_add_token_to_block_data' );

/**
 * Add a short-lived CHEFS token and confirmation message to the chefs-form block attributes.
 *
 * The token is fetched server-side only, so no public REST route is needed.
 * The API key never leaves the server.
 *
 * @param array $parsed_block Parsed block data.
 * @return array
 */
function bcew_chefs_embed_add_token_to_block_data( $parsed_block ) {
	if ( BCEW_CHEFS_EMBED_BLOCK_NAME !== ( $parsed_block['blockName'] ?? '' ) ) {
		return $parsed_block;
	}

	$form_id     = sanitize_text_field( (string) ( $parsed_block['attrs']['formId'] ?? '' ) );
	$credentials = '' === $form_id ? null : CredentialsManager::get_by_form_id( $form_id );

	// Without saved credentials no token can be fetched; render.php shows an error.
	if ( ! $credentials ) {
		return $parsed_block;
	}

	$authentication = ( new ChefsClient() )->authenticate( $credentials['form_id'], $credentials['api_key'] );

	if ( ! empty( $authentication['success'] ) && ! empty( $authentication['token'] ) ) {
		$parsed_block['attrs']['token'] = $authentication['token'];
	}

	$parsed_block['attrs']['confirmation'] = (string) CredentialsManager::get_confirmation( $form_id );

	return $parsed_block;
}

/**
 * Create or upgrade the credentials table.
 *
 * When the old options table is still present, copy each form's name and
 * confirmation onto the matching credentials row, then drop that table.
 * The API key, created time, and user ID stay on the credentials row.
 *
 * @return void
 */
function bcew_chefs_embed_maybe_install_credentials_table() {
	if ( CredentialsManager::has_legacy_options_table() ) {
		CredentialsManager::migrate_legacy_options_table();
		return;
	}

	if ( get_option( CredentialsManager::DB_VERSION_OPTION ) === CredentialsManager::DB_VERSION ) {
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
	} else {
		// Define the path to the build directory.
		$build_dir = plugin_dir_path( __FILE__ ) . 'dist/';

		// Use glob to find all block.json files in the subdirectories of the build folder.
		$block_files = glob( $build_dir . '*/block.json' );
		$block_files = false === $block_files ? array() : $block_files;

		// Loop through each block.json file.
		foreach ( $block_files as $block_file ) {
			// Register the block type from the metadata in block.json.
			register_block_type_from_metadata( $block_file );
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
	$block_type = \WP_Block_Type_Registry::get_instance()->get_registered( BCEW_CHEFS_EMBED_BLOCK_NAME );

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
		'/forms',
		[
			[
				'methods'             => 'GET',
				'callback'            => 'bcew_chefs_embed_get_saved_forms',
				'permission_callback' => 'bcew_chefs_embed_can_edit_posts',
			],
		]
	);
}

/**
 * Return saved CHEFS forms with display names and IDs.
 *
 * @return WP_REST_Response REST response containing saved forms.
 */
function bcew_chefs_embed_get_saved_forms() {
	$forms = CredentialsManager::list_forms();

	return new WP_REST_Response( $forms, 200 );
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
