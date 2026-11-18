<?php
namespace Bcew\Search;

/**
 * Utility class which is used for utility functions, mostly static functions for render.php.
 */
class Utility {

    /**
     * Get term name safely.
     *
     * @param object|WP_Error|null $term Term object or error.
     * @return string Term name or empty string.
     */
    public static function get_term_name_safe( $term ) {
        return ( $term && ! is_wp_error( $term ) ) ? $term->name : '';
    }

    /**
     * Get post type label.
     *
     * @param string $post_type Post type slug.
     * @return string Post type label or empty string.
     */
    public static function get_post_type_label_safe( $post_type ) {
        $obj = get_post_type_object( $post_type );
        return $obj ? $obj->labels->singular_name : '';
    }

    /**
     * Get user display name.
     *
     * @param int $user_id User ID.
     * @return string User display name or empty string.
     */
    public static function get_user_name_safe( $user_id ) {
        $user = get_user_by( 'ID', $user_id );
        return $user ? $user->display_name : '';
    }

    /**
     * Get category name safely.
     *
     * @param int $category_id Category ID.
     * @return string Category name or empty string.
     */
    public static function get_category_name_safe( $category_id ) {
        return self::get_term_name_safe( get_category( $category_id ) );
    }

    /**
     * Get tag name safely.
     *
     * @param int $tag_id Tag ID.
     * @return string Tag name or empty string.
     */
    public static function get_tag_name_safe( $tag_id ) {
        return self::get_term_name_safe( get_tag( $tag_id ) );
    }

    /**
     * Function to convert field names to user-friendly titles.
     *
     * @param string $field_value The field value in format 'posttype:fieldname'.
     * @return string Formatted field label for display.
     */
    public static function format_field_label( string $field_value ): string {
        // Extract just the field name (remove post type prefix).
        if ( \strpos( $field_value, ':' ) !== false ) {
            $parts      = \explode( ':', $field_value );
            $field_name = end( $parts );
        } else {
            $field_name = $field_value;
        }

        // Convert underscores to spaces and title case.
        $formatted = \str_replace( '_', ' ', $field_name );
        $formatted = \ucwords( $formatted );

        // Handle common field name patterns.
        $replacements = [
            'Sort Relevance'     => 'Sort Relevance',
            'Document File Name' => 'File Name',
            'Document File Url'  => 'File URL',
            'Document File Size' => 'File Size',
            'Document File Type' => 'File Type',
            'Post Date'          => 'Publication Date',
            'Page Order'         => 'Page Order',
            'This2'              => 'This 2',  // Handle numbered fields.
        ];

        foreach ( $replacements as $search => $replace ) {
            if ( \strcasecmp( $formatted, $search ) === 0 ) {
                return $replace;
            }
        }

        return $formatted;
    }
}
