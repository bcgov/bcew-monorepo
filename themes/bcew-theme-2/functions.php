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
 * Determines whether the BC Extended Web Search plugin is active.
 *
 * Detection is based on the plugin's block being registered, which is the most
 * reliable front-end signal (the plugin registers its blocks on `init`, before
 * blocks are rendered) and avoids loading wp-admin includes on the front end.
 *
 * @return bool True when BC Extended Web Search is providing its blocks.
 */
function bcew_is_search_plugin_active() {
	static $is_active = null;

	if ( null === $is_active ) {
		$is_active = WP_Block_Type_Registry::get_instance()->is_registered( 'wordpress-search/search-bar' );
	}

	return $is_active;
}

/**
 * Resolves a core search template-part slug to its plugin-powered counterpart.
 *
 * Mirrors BC Extended Web Search's own mapping so the header search bar and
 * the search results content use the plugin's blocks when it is active.
 *
 * @param string $slug Template part slug attribute.
 * @param string $area Template part area attribute.
 *
 * @return string The (possibly swapped) template part slug.
 */
function bcew_resolve_search_plugin_template_part_slug( $slug, $area ) {
	if ( 'uncategorized' !== $area ) {
		return $slug;
	}

	if ( 'search-bar' === $slug ) {
		return 'search-bar-with-search-plugin';
	}

	if ( 'search' === $slug ) {
		return 'search-with-search-plugin';
	}

	return $slug;
}

/**
 * Swaps the core search template parts for the plugin versions when the
 * BC Extended Web Search plugin is active. When the plugin is disabled the core
 * search parts are used so the site keeps working without it.
 *
 * @param array $parsed_block The parsed block being rendered.
 *
 * @return array The parsed block, with its template-part slug swapped when applicable.
 */
function bcew_swap_search_template_parts( $parsed_block ) {
	if ( 'core/template-part' !== ( $parsed_block['blockName'] ?? '' ) ) {
		return $parsed_block;
	}

	if ( ! bcew_is_search_plugin_active() ) {
		return $parsed_block;
	}

	$attrs = $parsed_block['attrs'] ?? array();
	$slug  = (string) ( $attrs['slug'] ?? '' );
	$area  = (string) ( $attrs['area'] ?? '' );
	$new   = bcew_resolve_search_plugin_template_part_slug( $slug, $area );

	if ( $new !== $slug ) {
		$parsed_block['attrs']['slug'] = $new;
	}

	return $parsed_block;
}
add_filter( 'render_block_data', 'bcew_swap_search_template_parts' );

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
