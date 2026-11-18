<?php

namespace Bcew\DocumentRepository;

use Bcew\DocumentRepository\{
    DocumentRepository,
    DocumentRevisionManager,
    Settings,
};
/**
 * Class Setup
 *
 * This class handles the setup for the Document Repository feature.
 *
 * @package Bcew\DocumentRepository
 */
class Setup {

    /**
     * Init function used to setup the WordPress hooks.
     *
     * @return void
     */
    public function init(): void {
        add_filter( 'post_type_link', [ $this, 'override_permalink' ], 10, 2 );
        add_filter( 'the_title', [ $this, 'append_file_info' ], 10, 2 );
        add_action( 'wp_insert_post', [ $this, 'force_publish_after_untrash' ], 10, 3 );
        add_action( 'init', [ $this, 'plugin_init' ] );
    }

    /**
     * Initiate all the classes, and startup code.
     *
     * @return void
     */
    public function plugin_init(): void {
        // Initialize services.
        $document_repository = new DocumentRepository();
        $document_repository->init();
        // Document revisions.
        $revision_manager = new DocumentRevisionManager();
        $revision_manager->init();
    }


    /**
     * Override document post permalink in search results with the direct file URL.
     *
     * @param string  $post_link The default post permalink.
     * @param WP_Post $post      The current post object.
     * @return string             The modified or original permalink.
     */
    public function override_permalink( string $post_link, $post ): string {
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
    public function append_file_info( string $title, int $post_id ): string {
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
     * @return void
     */
    public function force_publish_after_untrash( int $post_ID, $post, bool $update ): void {
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
}
