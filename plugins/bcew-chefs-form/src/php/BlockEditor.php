<?php
/**
 * Block editor integration.
 *
 * @package bcew-chefs-form
 */

namespace Bcgov\BcewChefsForm;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the CHEFS form block and editor settings.
 */
class BlockEditor {

	/**
	 * Register block editor hooks.
	 *
	 * @return void
	 */
	public function init() {
		$this->register_blocks();
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_settings' ) );
	}

	/**
	 * @return void
	 */
	public function register_blocks() {
		wp_register_block_types_from_metadata_collection(
			BCEW_CHEFS_FORM_PLUGIN_DIR . 'dist',
			BCEW_CHEFS_FORM_PLUGIN_DIR . 'dist/blocks-manifest.php'
		);
	}

	/**
	 * @return void
	 */
	public function enqueue_editor_settings() {
		wp_add_inline_script(
			'wp-blocks',
			'window.bcewChefsFormSettings=' . wp_json_encode(
				array(
					'forms'       => Credentials::list_forms(),
					'settingsUrl' => Settings::get_page_url(),
				)
			) . ';',
			'before'
		);
	}
}
