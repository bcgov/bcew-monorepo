<?php
namespace Bcew\Plugin;

use Bcew\Plugin\{
    ContentSecurityPolicy,
    DesignSystemSettings,
    NotificationBanner,
    SkipNavigation,
};
use Bcew\Plugin\Enqueue\{
    Script,
    Style
};
use Bcew\Plugin\InPageNav\InPageNav;
/**
 * Setup class, which is used to initialize plugin.
 */
class Setup {
    /**
     * Init function to run hooks, and initialize classes.
     *
     * @return void
     */
    public function init() {
        // Hook the function into the 'init' action.
        add_action( 'init', [ $this, 'register_blocks' ] );
        add_filter( 'block_categories_all', [ $this, 'add_new_block_category' ], 10, 2 );
        add_action( 'wp_enqueue_scripts', [ $this, 'get_dashicon_styles' ] );

        // Initialize the main Design System settings page.
        $design_system_settings = new DesignSystemSettings();
        $design_system_settings->init();
        // Initialize the custom banner class.
        $notification_banner = new NotificationBanner();
        $notification_banner->init();
        // Initialize the content security policy class.
        $content_security_policy = new ContentSecurityPolicy();
        $content_security_policy->init();
        // Initialize the content security policy class.
        $skip_navigation = new SkipNavigation();
        $skip_navigation->init();
        // Initialize the enqueueing styles class.
        $enqueue_styles = new Style();
        $enqueue_styles->init();
        // Initialize the enqueueing scripts class.
        $enqueue_scripts = new Script();
        $enqueue_scripts->init();
        // Initialize InPageNav.
        new InPageNav();
    }


    /**
     * Registers block metadata and assets from the generated dist directory.
     *
     * @return void
     */
    public function register_blocks() {
        $build_dir = plugin_dir_path( __DIR__ ) . 'dist/';

        if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
            wp_register_block_types_from_metadata_collection( $build_dir, $build_dir . 'blocks-manifest.php' );
        } else {
            foreach ( glob( $build_dir . '*/block.json' ) as $block_file ) {
                register_block_type_from_metadata( $block_file );
            }
        }
    }

    /**
     * Adds a new block category for Design System blocks
     *
     * This function adds a new category to the WordPress block editor (Gutenberg)
     * that will contain all Design System blocks. The category is added to the
     * beginning of the categories list using array_unshift.
     *
     * @since 1.0.0
     *
     * @param array $categories Array of block categories.
     * @return array   Modified array of block categories.
     */
    public function add_new_block_category( array $categories ): array {
        array_unshift(
            $categories,
            array(
                'slug'  => 'design-system',
                'title' => 'Design System',
            )
        );

        return $categories;
    }

    /**
     * If breadcrumbs is used, it ensures that the dashicons is enqueued.
     *
     * @return void
     */
    public function get_dashicon_styles() {
		if ( has_block( 'design-system-wordpress-plugin/breadcrumb' ) ) {
			wp_enqueue_style( 'dashicons' );
		}
    }
}
