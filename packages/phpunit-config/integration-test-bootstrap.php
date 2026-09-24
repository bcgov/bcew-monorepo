<?php
/**
 * PHPUnit bootstrap file.
 *
 * @package Wordpress_Utils
 */

$_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $_tests_dir ) {
    $_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

// Forward custom PHPUnit Polyfills configuration to PHPUnit bootstrap file.
$_phpunit_polyfills_path = getenv( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' );
if ( false === $_phpunit_polyfills_path ) {
	// When this package is installed in a plugin/theme vendor dir:
	// vendor/bcew-monorepo/phpunit-config → vendor/yoast/phpunit-polyfills
	$candidate = dirname( __DIR__, 2 ) . '/yoast/phpunit-polyfills';
	if ( is_dir( $candidate ) ) {
		$_phpunit_polyfills_path = $candidate;
	}
}
if ( false !== $_phpunit_polyfills_path ) {
    define( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH', $_phpunit_polyfills_path );
}

if ( ! file_exists( "{$_tests_dir}/includes/functions.php" ) ) {
    echo "Could not find {$_tests_dir}/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    exit( 1 );
}

// Give access to tests_add_filter() function.
require_once "{$_tests_dir}/includes/functions.php";

class EntrypointNotFoundException extends RuntimeException {}

/**
 * Manually load the plugin or theme being tested.
 */
function _manually_load_plugin_or_theme() {
    $entrypoint = _wordpressutils_find_entrypoint_file();
    if ($entrypoint === true) {
        _register_theme();
    } elseif (is_string($entrypoint)) {
        require_once   $entrypoint;
    } else {
        throw new EntrypointNotFoundException('Could not load plugin or theme entrypoint.');
    }
}

/**
 * Attempts to find the entrypoint of the theme or plugin being tested.
 * Themes should have a functions.php file entrypoint.
 * Plugins should have a *.php file entrypoint with certain headers.
 *
 * @return string|bool Return the path to the *.php entrypoint for
 *                     plugins. Return true for themes. Return false if
 *                     no entrypoint could be found.
 */
function _wordpressutils_find_entrypoint_file() {
    $path = dirname( __DIR__ );

    for ( $i = 0; $i < 5; $i++ ) {
        // If functions.php exists this is a theme, return true.
        if ( file_exists( $path . '/functions.php' ) ) {
            return true;
        }

        // Get all php files in the current directory.
        $files = glob( $path . '/*.php' );

        $default_headers = [
            'Plugin Name' => 'Plugin Name',
        ];

        // Plugins should have an entrypoint file with the Plugin Name header.
        foreach ( $files as $file ) {
            $file_data = get_file_data( $file, $default_headers );

            if ( ! empty( $file_data['Plugin Name'] ) ) {
                return $file;
            }
        }

        $parent_path = dirname( $path );
        if ( $parent_path === $path ) {
            break;
        }
        $path = $parent_path;
    }

    // No theme or plugin entrypoint was found.
    return false;
}

/**
 * Registers theme.
 */
function _register_theme() {

    $theme_dir = dirname( __DIR__ );

    for ( $i = 0; $i < 5; $i++ ) {
        if ( file_exists( $theme_dir . '/functions.php' ) ) {
            break;
        }

        $parent_theme_dir = dirname( $theme_dir );
        if ( $parent_theme_dir === $theme_dir ) {
            throw new EntrypointNotFoundException( 'Could not find theme root.' );
        }
        $theme_dir = $parent_theme_dir;
    }

    $current_theme = basename( $theme_dir );
    $theme_root    = dirname( $theme_dir );

    add_filter( 'theme_root', function () use ( $theme_root ) {
        return $theme_root;
    } );

    register_theme_directory( $theme_root );

    add_filter( 'pre_option_template', function () use ( $current_theme ) {
        return $current_theme;
    } );

    add_filter( 'pre_option_stylesheet', function () use ( $current_theme ) {
        return $current_theme;
    } );
}

tests_add_filter( 'muplugins_loaded', '_manually_load_plugin_or_theme' );

// Start up the WP testing environment.
require_once "{$_tests_dir}/includes/bootstrap.php";
