<?php
namespace Bcew\Search;

use Bcew\Search\ {
    TaxonomyFilter,
    MetadataTaxonomySearch,
    SearchHighlight,
    MetaFieldsAPI,
    SearchResultsSort,
};
/**
 * Setup class which is used for setup and initialization of plugin.
 */
class Setup {

    /**
     * Init function for running WordPress hooks.
     *
     * @return void
     */
    public function init(): void {
        add_action( 'init', [ $this, 'search_init' ] );
        add_filter( 'render_block_data', [ $this, 'render_block_data' ], 10, 1 );
        add_filter( 'block_categories_all', [ $this, 'register_block_category' ], 10, 1 );
    }

    /**
     * Search init for registering blocks, and initiating classes required for plugin operation.
     *
     * @return void
     */
    public function search_init(): void {
        // Register blocks.
        register_block_type( plugin_dir_path( __DIR__ ) . 'dist/Search' );
        register_block_type( plugin_dir_path( __DIR__ ) . 'dist/SearchPostFilter' );
        register_block_type( plugin_dir_path( __DIR__ ) . 'dist/SearchResultsPostMetadataDisplay' );
        register_block_type( plugin_dir_path( __DIR__ ) . 'dist/SearchTaxonomyFilter' );
        register_block_type( plugin_dir_path( __DIR__ ) . 'dist/SearchActiveFilters' );
        register_block_type( plugin_dir_path( __DIR__ ) . 'dist/SearchResultCount' );
        register_block_type( plugin_dir_path( __DIR__ ) . 'dist/SearchResultsSort' );
        register_block_type( plugin_dir_path( __DIR__ ) . 'dist/SearchModal' );

        // Initialize filter functionality.
        $wordpress_search_taxonomy_filter = new TaxonomyFilter();
        $wordpress_search_taxonomy_filter->init();

        $wordpress_search_metadata_taxonomy_search = new MetadataTaxonomySearch();
        $wordpress_search_metadata_taxonomy_search->init();

        $wordpress_search_highlight = new SearchHighlight();
        $wordpress_search_highlight->init();

        $wordpress_search_meta_fields_api = new MetaFieldsAPI();
        $wordpress_search_meta_fields_api->init();

        $wordpress_search_results_sort = new SearchResultsSort();
        $wordpress_search_results_sort->init();
    }


    /**
     * Wordpress-search plugin: use render_block_data to swap template parts when the plugin is active.
     * Swaps template parts to the plugin versions when the plugin is active.
     * - Search bar: slug search-bar → search-bar-with-search-plugin (in header).
     * - Search content: slug search → search-with-search-plugin (in search-content template).
     *
     * @param array $parsed_block The parsed block from the site content.
     * @return array
     */
    public function render_block_data( array $parsed_block ): array {
        if ( 'core/template-part' !== ( $parsed_block['blockName'] ?? '' ) ) {
                return $parsed_block;
        }
        $attrs = $parsed_block['attrs'] ?? array();
        $slug  = $attrs['slug'] ?? '';
        $area  = $attrs['area'] ?? '';
        $new   = TaxonomyFilter::resolve_plugin_template_part_slug( $slug, $area );
        if ( $new !== (string) $slug ) {
            $parsed_block['attrs']['slug'] = $new;
        }
        return $parsed_block;
    }

    /**
     * Register custom block category for search blocks.
     *
     * @param array $categories Array of block categories.
     * @return array Modified array of block categories.
     */
    public function register_block_category( array $categories ): array {
        return array_merge(
            array(
                array(
                    'slug'  => 'search',
                    'title' => __( 'Search', 'wordpress-search' ),
                    'icon'  => 'search',
                ),
            ),
            $categories
        );
    }
}
