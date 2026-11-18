<?php
/**
 * Plugin Name: BCEW Plugin
 * Plugin URI: https://github.com/bcgov/bcew-monorepo/tree/main/plugins/bcew-plugin
 * Author: govwordpress@gov.bc.ca
 * Author URI: https://apps.itsm.gov.bc.ca/jira/browse/ENG-138
 * Description: BCEW adds custom functionality for BC government sites.
 * Requires at least: 6.4.4
 * Tested up to: 6.5
 * Requires PHP: 7.4
 * Version: 2.18.0
 * License: Apache License Version 2.0
 * License URI: LICENSE
 * Text Domain: bcew-plugin
 * Tags:
 *
 * @package Bcew\Plugin
 */

use Bcew\Plugin\Setup;
/**
 * Load Composer autoloader and verify required class exists.
 * If the autoloader or the required class is missing, halt plugin execution.
 */
$autoloader_path = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $autoloader_path ) ) {
    require_once $autoloader_path;
}
if ( ! class_exists( 'Bcew\\Plugin\\DesignSystemSettings' ) ) {
    return;
}

$setup = new Setup();
$setup->init();
