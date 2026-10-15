<?php

/**
 * Integration tests for core plugin functions in bcew-chefs-embed.php.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

use Bcgov\BcewChefsEmbed\CredentialsManager;
use Bcgov\BcewChefsEmbed\Settings;

/**
 * Tests for plugin functions.
 */
class PluginFunctionsTest extends \WP_UnitTestCase
{

    /**
     * Set up test environment.
     *
     * @return void
     */
    public function set_up()
    {
        parent::set_up();
        CredentialsManager::install();

        global $wpdb;
        $table = CredentialsManager::table_name();
        // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Internal table name.
        $wpdb->query("DELETE FROM `{$table}`");
    }

    /**
     * Test bcew_chefs_embed_add_token_to_block_data ignores non-CHEFS blocks.
     *
     * @return void
     */
    public function test_add_token_to_block_data_ignores_other_blocks()
    {
        $block = array(
            'blockName' => 'core/paragraph',
            'attrs'     => array(),
        );

        $result = bcew_chefs_embed_add_token_to_block_data($block);

        $this->assertSame($block, $result);
    }

    /**
     * Test bcew_chefs_embed_add_token_to_block_data returns block unchanged when no blockName.
     *
     * @return void
     */
    public function test_add_token_to_block_data_handles_missing_block_name()
    {
        $block = array(
            'attrs' => array(),
        );

        $result = bcew_chefs_embed_add_token_to_block_data($block);

        $this->assertSame($block, $result);
    }

    /**
     * Test bcew_chefs_embed_add_token_to_block_data returns block unchanged when no formId.
     *
     * @return void
     */
    public function test_add_token_to_block_data_handles_missing_form_id()
    {
        $block = array(
            'blockName' => 'bcew-chefs-embed/chefs-form',
            'attrs'     => array(),
        );

        $result = bcew_chefs_embed_add_token_to_block_data($block);

        $this->assertSame($block, $result);
    }

    /**
     * Test bcew_chefs_embed_add_token_to_block_data handles empty formId.
     *
     * @return void
     */
    public function test_add_token_to_block_data_handles_empty_form_id()
    {
        $block = array(
            'blockName' => 'bcew-chefs-embed/chefs-form',
            'attrs'     => array(
                'formId' => '',
            ),
        );

        $result = bcew_chefs_embed_add_token_to_block_data($block);

        $this->assertSame($block, $result);
    }

    /**
     * Test bcew_chefs_embed_add_token_to_block_data returns block unchanged when no credentials.
     *
     * @return void
     */
    public function test_add_token_to_block_data_handles_missing_credentials()
    {
        $block = array(
            'blockName' => 'bcew-chefs-embed/chefs-form',
            'attrs'     => array(
                'formId' => 'nonexistent-form',
            ),
        );

        $result = bcew_chefs_embed_add_token_to_block_data($block);

        $this->assertSame($block, $result);
    }

    /**
     * Test bcew_chefs_embed_add_token_to_block_data adds confirmation when credentials exist.
     *
     * @return void
     */
    public function test_add_token_to_block_data_adds_confirmation()
    {
        CredentialsManager::save('test-form', 'test-key');
        CredentialsManager::save_confirmation('test-form', 'Thanks for applying.');

        $block = array(
            'blockName' => 'bcew-chefs-embed/chefs-form',
            'attrs'     => array(
                'formId' => 'test-form',
            ),
        );

        $result = bcew_chefs_embed_add_token_to_block_data($block);

        $this->assertSame('Thanks for applying.', $result['attrs']['confirmation']);
    }

    /**
     * Test bcew_chefs_embed_admin_init does not error when called.
     *
     * @return void
     */
    public function test_admin_init_does_not_error()
    {
        if (! class_exists(Settings::class)) {
            $this->markTestSkipped('Settings class not available.');
        }

        // Call the function; it should complete without error.
        bcew_chefs_embed_admin_init();

        $this->assertTrue(true, 'Function should complete without error.');
    }

    /**
     * Test bcew_chefs_embed_init can be called without error.
     *
     * @return void
     */
    public function test_init_does_not_error()
    {
        // The block is likely already registered from prior tests.
        // Calling init should gracefully handle this.
        // Suppress the "already registered" error by WordPress for this test.
        $this->setExpectedIncorrectUsage('WP_Block_Type_Registry::register');

        bcew_chefs_embed_init();

        $registry = \WP_Block_Type_Registry::get_instance();
        $this->assertTrue($registry->is_registered('bcew-chefs-embed/chefs-form'));
    }

}
