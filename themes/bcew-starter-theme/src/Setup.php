<?php
namespace Bcew\StarterTheme;

/**
 * Setup class, used for initiating theme.
 */
class Setup {

    /**
     * Init function, that loads all the hooks and setup for theme.
     *
     * @return void
     */
    public function init(): void {
        add_action( 'init', [ $this, 'disable_default_block_patterns' ] );
        add_action( 'init', [ $this, 'heading_block_style_variations' ] );
        add_action( 'enqueue_block_assets', [ $this, 'enqueue_global_styles' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_global_styles' ] );
    }

    /**
     * Disables core block patterns.
     *
     * @return void
     */
    public function disable_default_block_patterns(): void {
        remove_theme_support( 'core-block-patterns' );
    }

    /**
     * Enqueues BCEW global styles (BC Sans fonts and design tokens) on the frontend and in the editor.
     *
     * @return void
     */
    public function enqueue_global_styles(): void {
        $stylesheet = get_template_directory() . '/dist/index.css';

        if ( ! file_exists( $stylesheet ) ) {
            return;
        }

        $asset_file = get_template_directory() . '/dist/index.asset.php';
        $version    = file_exists( $asset_file ) ? ( include $asset_file )['version'] : filemtime( $stylesheet );

        wp_enqueue_style(
            'bcew-starter-theme-styles',
            get_template_directory_uri() . '/dist/index.css',
            array(),
            $version
        );
    }

    /**
     * Registers cusstom block style variation.
     *
     * @return void
     */
    public function heading_block_style_variations(): void {
        $block_name       = 'core/heading';
        $style_properties = array(
            'name'         => 'heading-callout',
            'label'        => __( 'Callout', 'bcew-starter-theme' ),
            'isDefault'    => false,
            'style_handle' => 'bcew-starter-theme-styles',
        );
        register_block_style( $block_name, $style_properties );
    }
}
