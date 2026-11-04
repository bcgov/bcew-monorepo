<?php
/**
 * Smoke tests for the bcew-blocks plugin bootstrap.
 *
 * @package Bcew\Blocks\Test
 */

namespace Bcew\Blocks\Test;

class Test_Plugin_Functions extends \WP_UnitTestCase {

	/**
	 * The plugin's hook callbacks use the bcew_blocks_ prefix.
	 */
	public function test_hook_callbacks_are_registered() {
		$this->assertTrue( function_exists( 'bcew_blocks_init' ) );
		$this->assertTrue( function_exists( 'bcew_blocks_list_uses_context' ) );
		$this->assertTrue( function_exists( 'bcew_blocks_hide_empty_list' ) );

		$this->assertIsInt( has_action( 'init', 'bcew_blocks_init' ) );
		$this->assertIsInt( has_filter( 'register_block_type_args', 'bcew_blocks_list_uses_context' ) );
		$this->assertIsInt( has_filter( 'render_block_core/list', 'bcew_blocks_hide_empty_list' ) );
	}

	/**
	 * The plugin's blocks are registered on init.
	 */
	public function test_blocks_are_registered() {
		$registry = \WP_Block_Type_Registry::get_instance();

		$this->assertTrue( $registry->is_registered( 'bcew-blocks/icon' ) );
		$this->assertTrue( $registry->is_registered( 'bcew-blocks/media-text-layout' ) );
	}
}
