<?php
/**
 * Theme functions and definitions
 *
 * @package BcewStarterTheme
 */

/**
 * Load Composer autoloader and verify required class exists.
 * If the autoloader or the required class is missing, halt plugin execution.
 */
$autoloader_path = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $autoloader_path ) ) {
    require_once $autoloader_path;
}

if ( ! class_exists( 'Bcew\\StarterTheme\\Setup' ) ) {
    wp_die( "Class Bcew\\StarterTheme\\Setup doesn't exists" );
}
use Bcew\StarterTheme\Setup;
$setup = new Setup();
$setup->init();
