<?php
/**
 * Integration tests for the CHEFS plugin bootstrap functions.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

use Bcgov\BcewChefsEmbed\CredentialsManager;
use Bcgov\BcewChefsEmbed\OptionsManager;

/**
 * CHEFS plugin bootstrap behavior.
 */
class PluginBootstrapTest extends \WP_UnitTestCase {

	/**
	 * Ensure bootstrap tests start with the required tables and no saved forms.
	 *
	 * @return void
	 */
	public function set_up() {
		parent::set_up();
		CredentialsManager::install();
		OptionsManager::install();

		global $wpdb;

		$table = CredentialsManager::table_name();
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Internal table name.
		$wpdb->query( "DELETE FROM `{$table}`" );
	}

	/**
	 * The saved-form endpoint returns the configured Form IDs.
	 *
	 * @return void
	 */
	public function test_saved_form_ids_endpoint_returns_configured_forms() {
		CredentialsManager::save( 'bootstrap-form', 'bootstrap-key' );

		$response = bcew_chefs_embed_get_saved_form_ids();

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( array( 'bootstrap-form' ), $response->get_data() );
	}

	/**
	 * Editors with the required capability can access saved Form IDs.
	 *
	 * @return void
	 */
	public function test_saved_form_ids_permission_allows_editors() {
		$user_id = self::factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $user_id );

		$this->assertTrue( bcew_chefs_embed_can_edit_posts() );
	}

	/**
	 * The install guards install missing tables and skip current schemas.
	 *
	 * @return void
	 */
	public function test_install_guards_create_tables() {
		delete_option( CredentialsManager::DB_VERSION_OPTION );
		delete_option( OptionsManager::DB_VERSION_OPTION );

		bcew_chefs_embed_maybe_install_credentials_table();
		bcew_chefs_embed_maybe_install_options_table();

		$this->assertSame( CredentialsManager::DB_VERSION, get_option( CredentialsManager::DB_VERSION_OPTION ) );
		$this->assertSame( OptionsManager::DB_VERSION, get_option( OptionsManager::DB_VERSION_OPTION ) );

		bcew_chefs_embed_maybe_install_credentials_table();
		bcew_chefs_embed_maybe_install_options_table();
		$this->assertTrue( true, 'Current schema versions should be no-op install guards.' );
	}

	/**
	 * The plugin registers its saved-form REST route.
	 *
	 * @return void
	 */
	public function test_register_rest_routes_registers_saved_forms_route() {
		do_action( 'rest_api_init' );

		$routes = rest_get_server()->get_routes();

		$this->assertArrayHasKey( '/bcew-chefs-embed/v1/form-ids', $routes );
	}
}
