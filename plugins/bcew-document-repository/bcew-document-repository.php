<?php
/**
 * Plugin Name:       BCEW – Document Repository
 * Plugin URI:        https://github.com/bcgov/bcew-monorepo/plugins/bcew-document-repository
 * Description:       WordPress Document Repository plugin is a plugin that enhances the ability to upload and manage
 * Version:           1.2.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            govwordpress@gov.bc.ca
 * License:           Apache Licence version 2.0
 * License URI:       https://www.apache.org/licenses/LICENSE-2.0
 * Text Domain:       bcew-document-repository
 *
 * @package BcewDocumentRepository
 */

// Ensure WordPress is loaded.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

use Bcgov\BcewDocumentRepository\{
    DocumentRepository,
    DocumentRevisionManager,
    Settings,
};

/**
 * Check if we're in the site editor to avoid API conflicts.
 *
 * @return bool True if in site editor, false otherwise.
 */
function is_site_editor() {
    if ( ! is_admin() || ! function_exists( 'get_current_screen' ) ) {
        return false;
    }

    $screen = get_current_screen();
    return $screen && (
        'appearance_page_gutenberg-edit-site' === $screen->id ||
        strpos( $screen->id, 'site-editor' ) !== false ||
        strpos( $screen->id, 'gutenberg-edit-site' ) !== false
    );
}

// Initialize autoloader.
$local_composer = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $local_composer ) ) {
    require_once $local_composer;
}

if ( ! class_exists( 'Bcgov\\BcewDocumentRepository\\Settings' ) ) {
    add_action(
        'admin_notices',
        function () {
			echo '<div class="notice notice-error"><p>';
			esc_html_e( 'BCEW Document Repository plugin error: Autoloading failed. Please run composer install in the plugin directory.', 'bcew-document-repository' );
			echo '</p></div>';
		}
    );
    return;
}

// Initialize services.
$bcew_document_repository          = new DocumentRepository();
$bcew_document_repository_settings = new Settings();

// Document rrevisions.
$revision_manager = new DocumentRevisionManager();
$revision_manager->init();

// Always register post types and taxonomies (needed everywhere).
add_action( 'init', [ $bcew_document_repository, 'register_post_types' ] );
add_action( 'init', [ $bcew_document_repository, 'register_metadata_taxonomies' ], 15 );

// Only initialize plugin features if NOT in site editor.
if ( ! is_site_editor() ) {
    // Admin features.
    if ( is_admin() ) {
        add_action( 'admin_menu', [ $bcew_document_repository, 'register_admin_menus' ] );
        add_action( 'admin_init', [ $bcew_document_repository, 'init_admin_without_menus' ] );
        $bcew_document_repository_settings->init();
    }

    // Frontend features.
    if ( ! is_admin() ) {
        $bcew_document_repository->init_frontend();
    }

    // REST API routes.
    add_action( 'rest_api_init', [ $bcew_document_repository, 'register_rest_routes' ], 10 );

    // Frontend-specific hooks.
    add_filter( 'post_type_link', 'bcew_document_repository_override_permalink', 10, 2 );
    add_filter( 'the_title', 'bcew_document_repository_append_file_info', 10, 2 );
    add_action( 'wp_insert_post', 'bcew_document_repository_force_publish_after_untrash', 10, 3 );
}

/**
 * Override document post permalink in search results with the direct file URL.
 *
 * @param string  $post_link The default post permalink.
 * @param WP_Post $post      The current post object.
 * @return string             The modified or original permalink.
 */
function bcew_document_repository_override_permalink( $post_link, $post ) {
    if ( is_search() && isset( $post->post_type ) && 'document' === $post->post_type ) {
        $file_id = get_post_meta( $post->ID, 'document_file_id', true );
        if ( $file_id ) {
            $file_path = get_attached_file( $file_id );
            $file_url  = wp_get_attachment_url( $file_id );

            if ( $file_path && false !== strpos( $file_path, '/documents/' ) ) {
                $upload_dir = wp_upload_dir();
                $file_url   = $upload_dir['baseurl'] . '/documents/' . basename( $file_path );
            }

            if ( ! empty( $file_url ) ) {
                return esc_url( $file_url );
            }
        }
    }
    return $post_link;
}

/**
 * Append file type and size to document titles in search results.
 *
 * Formats the document title to include the file extension in uppercase
 * and the file size with one decimal precision, using KB for sizes under
 * 1 MB and MB for sizes 1 MB or larger.
 *
 * If either the file type or size cannot be determined, the brackets are omitted.
 * Applies only to 'document' post types in search results.
 *
 * @param string $title   The original post title.
 * @param int    $post_id The current post ID.
 * @return string          The modified or original title.
 */
function bcew_document_repository_append_file_info( $title, $post_id ) {
    if ( is_search() && 'document' === get_post_type( $post_id ) ) {
        $file_id = get_post_meta( $post_id, 'document_file_id', true );
        if ( $file_id ) {
            $file_path = get_attached_file( $file_id );
            if ( $file_path && file_exists( $file_path ) ) {
                $file_type = strtoupper( pathinfo( $file_path, PATHINFO_EXTENSION ) );

                $size_bytes          = filesize( $file_path );
                $file_size_formatted = '';
                // Convert the file size to MB or KB as appropriate.
                if ( $size_bytes > 0 ) {
                    if ( $size_bytes >= 1048576 ) {
                        $file_size_formatted = number_format_i18n( $size_bytes / 1048576, 1 ) . 'MB';
                    } else {
                        $file_size_formatted = number_format_i18n( $size_bytes / 1024, 1 ) . 'KB';
                    }
                }
                // Add the file type and size to the title, if available.
                $info_parts = [];
                if ( $file_type ) {
                    $info_parts[] = $file_type;
                }
                if ( $file_size_formatted ) {
                    $info_parts[] = $file_size_formatted;
                }
                if ( ! empty( $info_parts ) ) {
                    $title .= ' (' . implode( ', ', $info_parts ) . ')';
                }
            }
        }
    }
    return $title;
}

/**
 * Force post status to 'publish' after untrashing.
 *
 * @param int     $post_ID Post ID.
 * @param WP_Post $post    Post object.
 * @param bool    $update  Whether this is an existing post being updated.
 */
function bcew_document_repository_force_publish_after_untrash( $post_ID, $post, $update ) {
	if ( 'document' === $post->post_type && $update ) {
		// Check if this was just untrashed by looking at the post status.
		$current_status = get_post_status( $post_ID );
		if ( 'draft' === $current_status ) {
			// Force it to publish.
			wp_update_post(
                array(
					'ID'          => $post_ID,
					'post_status' => 'publish',
                )
            );
		}
	}
}
