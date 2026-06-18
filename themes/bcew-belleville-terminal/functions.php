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
 * Enqueue theme styles.
 */
function bcew_belleville_terminal_enqueue_styles() {
    $dist_path = get_stylesheet_directory() . '/dist/index.css';
    $version   = file_exists( $dist_path ) ? filemtime( $dist_path ) : null;
    wp_enqueue_style(
        'bcew-belleville-terminal-style',
        get_stylesheet_directory_uri() . '/dist/index.css',
        array(),
        $version
    );
}

add_action( 'wp_enqueue_scripts', 'bcew_belleville_terminal_enqueue_styles' );
