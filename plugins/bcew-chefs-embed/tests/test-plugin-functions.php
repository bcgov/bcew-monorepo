<?php
/**
 * Integration tests for core plugin functions in bcew-chefs-embed.php.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

/**
 * Tests for plugin functions.
 */
class PluginFunctionsTest extends \WP_UnitTestCase {

    /**
     * Test bcew_chefs_embed_init can be called without error.
     *
     * @return void
     */
    public function test_init_does_not_error() {
        $block_registry = \WP_Block_Type_Registry::get_instance();
        if ( $block_registry->is_registered( BCEW_CHEFS_EMBED_BLOCK_NAME ) ) {
            $block_registry->unregister( BCEW_CHEFS_EMBED_BLOCK_NAME );
        }

        $has_init_hook = has_action( 'init', 'bcew_chefs_embed_init' );

        bcew_chefs_embed_init();

        $this->assertNotFalse( $has_init_hook );
    }
}
