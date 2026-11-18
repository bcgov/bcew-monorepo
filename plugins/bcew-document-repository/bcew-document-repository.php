<?php
/**
 * Plugin Name:       BCEW Document Repository
 * Plugin URI:        https://github.com/bcgov/bcew-monorepo/plugins/bcew-document-repository
 * Description:       WordPress Document Repository plugin is a plugin that enhances the ability to upload and manage
 * Version:           1.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            govwordpress@gov.bc.ca
 * License:           Apache Licence version 2.0
 * License URI:       https://www.apache.org/licenses/LICENSE-2.0
 * Text Domain:       bcew-document-repository
 *
 * @package Bcew\DocumentRepository
 */

// Ensure WordPress is loaded.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

use Bcew\DocumentRepository\Setup;



// Initialize autoloader.
$local_composer = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $local_composer ) ) {
    require_once $local_composer;
}

if ( ! class_exists( 'Bcew\\DocumentRepository\\Setup' ) ) {
    wp_die( 'BCEW Document Repository error: The class Bcew\\DocumentRepository\\Setup could not be found.' );
}

$setup = new Setup();
$setup->init();
