<?php
/**
 * Theme functions and definitions
 *
 * @package BcewTheme2
 */

/**
 * Disables the default patterns from WordPress.
 */
function bcew_disable_default_block_patterns() {
    remove_theme_support( 'core-block-patterns' );
}
add_action( 'init', 'bcew_disable_default_block_patterns' );

/**
 * Enqueues BCEW global styles (BC Sans fonts and design tokens) on the frontend and in the editor.
 */
function bcew_enqueue_global_styles() {
	$stylesheet = get_template_directory() . '/dist/index.css';

	if ( ! file_exists( $stylesheet ) ) {
		return;
	}

	$asset_file = get_template_directory() . '/dist/index.asset.php';
	$version    = file_exists( $asset_file ) ? ( include $asset_file )['version'] : filemtime( $stylesheet );

	wp_enqueue_style(
		'bcew-theme-styles',
		get_template_directory_uri() . '/dist/index.css',
		array(),
		$version
	);
}
add_action( 'enqueue_block_assets', 'bcew_enqueue_global_styles' );
add_action( 'admin_enqueue_scripts', 'bcew_enqueue_global_styles' );

/**
 * Load Composer autoloader and verify required class exists.
 * If the autoloader or the required class is missing, halt plugin execution.
 */
$autoloader_path = __DIR__ . '/vendor/autoload.php';
if ( file_exists( $autoloader_path ) ) {
    require_once $autoloader_path;
}

/**
 * Enable appearance tools for super admins only.
 *
 * @param WP_Theme_JSON_Data $theme_json Theme JSON data object.
 *
 * @return WP_Theme_JSON_Data
 */
function extended_web_enable_appearance_tools_for_super_admins( $theme_json ) {
    if ( ! is_super_admin() ) {
        return $theme_json;
    }

    return $theme_json->update_with(
        array(
            'version'  => 3,
            'settings' => array(
                'appearanceTools' => true,
            ),
        )
    );
}
add_filter( 'wp_theme_json_data_theme', 'extended_web_enable_appearance_tools_for_super_admins', 20 );

/**
 * Restrict access to the locking UI to Administrators.
 *
 * @param array $settings Default editor settings.
 */
function bcew_restrict_locking_unlocking_blocks( $settings ) {
    $settings['canLockBlocks'] = current_user_can( 'activate_plugins' );
    return $settings;
}
add_filter( 'block_editor_settings_all', 'bcew_restrict_locking_unlocking_blocks', 10, 2 );


/**
 * Registers the post title block styles (e.g. Underline).
 *
 * @since 1.0.0
 */
function bcew_register_post_title_block_styles() {
	$block_name       = 'core/post-title';
	$style_properties = array(
		'name'         => 'underline-title',
		'label'        => __( 'Underline' ),
		'isDefault'    => false,
		'style_handle' => 'bcew-theme-styles',
	);
	register_block_style( $block_name, $style_properties );
}
add_action( 'init', 'bcew_register_post_title_block_styles' );
