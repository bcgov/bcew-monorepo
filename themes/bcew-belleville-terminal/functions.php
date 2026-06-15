<?php
/**
 * Theme functions and definitions
 *
 * @package Bcew_Belleville_Terminal
 */

/**
 * Load Composer autoloader and verify required class exists.
 * If the autoloader or the required class is missing, halt plugin execution.
 */
$autoloader_path = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $autoloader_path ) ) {
    require_once $autoloader_path;
}

/**
 * Replace the parent theme palette merge callback with a safe variant.
 *
 * The parent implementation assumes child palette data exists under
 * settings.color.palette.theme, which is not always true.
 *
 * @param object $theme_json Theme JSON object provided by WordPress.
 */
function bcew_fix_design_system_theme_json_palette_merge( $theme_json ) {
    if ( ! is_child_theme() ) {
        return $theme_json;
    }

    if ( ! is_object( $theme_json ) || ! method_exists( $theme_json, 'get_data' ) ) {
        return $theme_json;
    }

    $theme_json_data = $theme_json->get_data();
    $parent_palette  = array();

    $parent_theme    = wp_get_theme( 'design-system-wordpress-theme' );
    $theme_json_path = $parent_theme->get_theme_root() . '/' . $parent_theme->get_stylesheet() . '/theme.json';

    if ( file_exists( $theme_json_path ) ) {
        $parent_theme_json_content = implode( '', file( $theme_json_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES ) );
        $parent_theme_json_data    = json_decode( $parent_theme_json_content, true );

        if ( isset( $parent_theme_json_data['settings']['color']['palette'] ) && is_array( $parent_theme_json_data['settings']['color']['palette'] ) ) {
            $parent_palette = $parent_theme_json_data['settings']['color']['palette'];
        }
    }

    $child_palette = array();

    if ( isset( $theme_json_data['settings']['color']['palette'] ) && is_array( $theme_json_data['settings']['color']['palette'] ) ) {
        $raw_child_palette = $theme_json_data['settings']['color']['palette'];
        $child_palette     = isset( $raw_child_palette['theme'] ) && is_array( $raw_child_palette['theme'] )
            ? $raw_child_palette['theme']
            : $raw_child_palette;
    }

    return $theme_json->update_with(
        array(
            'version'  => 3,
            'settings' => array(
                'color' => array(
                    'palette' => array_merge( $parent_palette, $child_palette ),
                ),
            ),
        )
    );
}

add_action(
    'after_setup_theme',
    static function () {
        if ( ! function_exists( 'design_system_combine_parent_child_theme_json' ) ) {
            return;
        }

        remove_filter( 'wp_theme_json_data_theme', 'design_system_combine_parent_child_theme_json' );
        add_filter( 'wp_theme_json_data_theme', 'bcew_fix_design_system_theme_json_palette_merge' );
    },
    20
// Enqueue built dist CSS when available, otherwise fallback to root style.css.
$dist_path = get_stylesheet_directory() . '/dist/index.css';
// Always enqueue built dist CSS. Ensure build runs in CI/dev before deploying.
$version = file_exists( $dist_path ) ? filemtime( $dist_path ) : null;
wp_enqueue_style(
    'bcew-belleville-terminal-style',
    get_stylesheet_directory_uri() . '/dist/index.css',
    array(),
    $version
);
