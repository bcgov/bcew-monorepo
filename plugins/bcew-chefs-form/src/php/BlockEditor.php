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
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_view_settings' ) );
	}

	/**
	 * Shared settings for the block scripts.
	 *
	 * @param bool $include_editor Whether to include editor-only settings.
	 * @return array
	 */
	private function get_script_settings( $include_editor = false ) {
		$settings = array(
			'embedConfigUrl' => rest_url( 'bcew-chefs/v1/embed-config' ),
		);

		if ( $include_editor ) {
			$settings['forms']       = Credentials::list_forms();
			$settings['settingsUrl'] = Settings::get_page_url();
		}

		return $settings;
	}

	/**
	 * Register block types from the built dist/ metadata.
	 *
	 * Uses the WP 6.8 collection API when available, otherwise falls back to
	 * per-block registration for WordPress 6.7 (plugin minimum).
	 *
	 * @return void
	 */
	public function register_blocks() {
		$dist_dir = BCEW_CHEFS_FORM_PLUGIN_DIR . 'dist';

		if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
			wp_register_block_types_from_metadata_collection(
				$dist_dir,
				$dist_dir . '/blocks-manifest.php'
			);
			return;
		}

		$block_files = glob( $dist_dir . '/*/block.json' );
		if ( ! is_array( $block_files ) ) {
			return;
		}

		foreach ( $block_files as $block_file ) {
			register_block_type_from_metadata( $block_file );
		}
	}

	/**
	 * Expose settings to the block editor.
	 *
	 * @return void
	 */
	public function enqueue_editor_settings() {
		wp_add_inline_script(
			'wp-blocks',
			'window.bcewChefsFormSettings=' . wp_json_encode( $this->get_script_settings( true ) ) . ';',
			'before'
		);
	}

	/**
	 * Expose the REST embed-config URL to the frontend view script.
	 *
	 * Uses rest_url() so this works when pretty permalinks /wp-json/ rewrites
	 * are not available (common in local wp-env).
	 *
	 * @return void
	 */
	public function enqueue_view_settings() {
		$handle = 'bcew-chefs-form-chefs-form-view-script';
		if ( ! wp_script_is( $handle, 'registered' ) && ! wp_script_is( $handle, 'enqueued' ) ) {
			return;
		}

		wp_add_inline_script(
			$handle,
			'window.bcewChefsFormSettings=' . wp_json_encode( $this->get_script_settings() ) . ';',
			'before'
		);
	}
}
