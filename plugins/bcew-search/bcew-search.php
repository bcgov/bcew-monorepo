<?php
/**
 * Plugin Name: BCEW Search
 * Plugin URI: https://github.com/bcgov/bcew-monorepo/tree/main/plugins/bcew-search
 * Author: govwordpress@gov.bc.ca
 * Author URI: https://citz-gdx.atlassian.net/browse/DSWP-114
 * Description: Adds customizable search blocks and enhanced search functionality to WordPress.
 * Requires at least: 6.4.4
 * Tested up to: 6.5
 * Requires PHP: 7.4
 * Version: 1.2.0
 * License: Apache License Version 2.0
 * License URI: LICENSE
 * Text Domain: wordpress-search
 * Tags:
 *
 * @package WordPressSearch
 */

// Ensure WordPress is loaded.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


// Autoload classes using Composer.
$local_composer = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $local_composer ) ) {
    require_once $local_composer;
}

// Check if the required classes exist.
if ( ! class_exists( 'Bcew\\Search\\Setup' ) ) {
    wp_die( 'BCEW Search error: The required class Bcew\\Search\\Setup could not be found.' );
}
use Bcew\Search\Setup;
$setup = new Setup();
$setup->init();
