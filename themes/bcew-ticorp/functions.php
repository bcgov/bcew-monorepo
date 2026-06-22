<?php
/**
 * Theme functions and definitions
 *
 * @package Design_System_WordPress_Child_Theme_TI_Corp
 */

/**
 * Load Composer autoloader and verify required class exists.
 * If the autoloader or the required class is missing, halt plugin execution.
 */
$autoloader_path = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $autoloader_path ) ) {
    require_once $autoloader_path;
}
