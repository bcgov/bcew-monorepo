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
