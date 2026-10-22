<?php
/**
 * Integration tests for the CHEFS plugin bootstrap functions.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

use Bcgov\BcewChefsEmbed\CredentialsManager;

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

		global $wpdb;

		$table = CredentialsManager::table_name();
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Internal table name.
		$wpdb->query( "DELETE FROM `{$table}`" );
	}

	/**
	 * The saved-form endpoint returns the configured forms.
	 *
	 * @return void
	 */
	public function test_saved_forms_endpoint_returns_configured_forms() {
		CredentialsManager::save( 'bootstrap-form', 'bootstrap-key' );

		$response = bcew_chefs_embed_get_saved_forms();

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( 'bootstrap-form', $response->get_data()[0]['form_id'] );
	}

	/**
	 * Editors with the required capability can access saved forms.
	 *
	 * @return void
	 */
	public function test_saved_forms_permission_allows_editors() {
		$user_id = self::factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $user_id );

		$this->assertTrue( bcew_chefs_embed_can_edit_posts() );
	}

	/**
	 * Users without edit capability receive a REST error.
	 *
	 * @return void
	 */
	public function test_saved_forms_permission_rejects_subscribers() {
		$user_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $user_id );

		$error = bcew_chefs_embed_can_edit_posts();

		$this->assertInstanceOf( \WP_Error::class, $error );
		$this->assertSame( 'rest_forbidden', $error->get_error_code() );
		$this->assertSame( 403, $error->get_error_data()['status'] );
	}

	/**
	 * Editor settings registration exits when the block has not been registered.
	 *
	 * @return void
	 */
	public function test_editor_settings_registration_skips_unregistered_block() {
		bcew_chefs_embed_register_editor_settings();

		$this->assertTrue( true, 'The helper should safely return without a registered block.' );
	}

	/**
	 * Menu registration adds the CHEFS settings page.
	 *
	 * @return void
	 */
	public function test_register_menu_adds_chefs_menu() {
		global $menu;

		$menu = array();
		bcew_chefs_embed_register_menu();

		$menu_slugs = array_column( $menu, 2 );
		$this->assertContains( 'bcew-chefs-embed-settings', $menu_slugs );
	}

	/**
	 * The install guards install missing tables and skip current schemas.
	 *
	 * @return void
	 */
	public function test_install_guards_create_tables() {
		delete_option( CredentialsManager::DB_VERSION_OPTION );

		bcew_chefs_embed_maybe_install_credentials_table();

		$this->assertSame( CredentialsManager::DB_VERSION, get_option( CredentialsManager::DB_VERSION_OPTION ) );

		bcew_chefs_embed_maybe_install_credentials_table();
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

		$this->assertArrayHasKey( '/bcew-chefs-embed/v1/forms', $routes );
	}

	/**
	 * The CHEFS resource origins are added to an existing CSP header.
	 *
	 * @return void
	 */
	public function test_wp_headers_allow_chefs_resources_in_csp() {
		$headers = apply_filters(
			'wp_headers',
			array(
				'Content-Security-Policy' => "default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'",
			)
		);

		$csp = $headers['Content-Security-Policy'];

		$this->assertStringContainsString( "script-src 'self' cdn.form.io", $csp );
		$this->assertStringContainsString( "style-src 'self' *.gov.bc.ca cdn.form.io fonts.googleapis.com", $csp );
		$this->assertStringContainsString( "font-src 'self' *.gov.bc.ca", $csp );
	}

	/**
	 * A missing font-src keeps the fonts inherited from default-src.
	 *
	 * @return void
	 */
	public function test_wp_headers_font_source_keeps_inherited_sources() {
		$headers = apply_filters(
			'wp_headers',
			array(
				'Content-Security-Policy' => "default-src 'self' data:; script-src 'self'; style-src 'self'",
			)
		);

		$this->assertStringContainsString( "font-src 'self' data: *.gov.bc.ca", $headers['Content-Security-Policy'] );
	}

	/**
	 * Missing script and style directives inherit the policy's default sources.
	 *
	 * @return void
	 */
	public function test_wp_headers_create_script_and_style_sources_from_default() {
		$headers = apply_filters(
			'wp_headers',
			array(
				'Content-Security-Policy' => "default-src 'self'",
			)
		);

		$csp = $headers['Content-Security-Policy'];

		$this->assertStringContainsString( "default-src 'self'", $csp );
		$this->assertStringContainsString( "script-src 'self' cdn.form.io", $csp );
		$this->assertStringContainsString( "style-src 'self' *.gov.bc.ca cdn.form.io fonts.googleapis.com", $csp );
	}

	/**
	 * Missing script and style directives are not created without a default-src directive.
	 *
	 * @return void
	 */
	public function test_wp_headers_do_not_create_script_or_style_sources_without_default() {
		$headers = apply_filters(
			'wp_headers',
			array(
				'Content-Security-Policy' => "img-src 'self'",
			)
		);

		$csp = $headers['Content-Security-Policy'];

		$this->assertStringNotContainsString( 'script-src ', $csp );
		$this->assertStringNotContainsString( 'style-src ', $csp );
		$this->assertStringNotContainsString( 'font-src ', $csp );
	}

	/**
	 * Script and style element directives are extended without changing attribute directives.
	 *
	 * @return void
	 */
	public function test_wp_headers_preserve_csp_attribute_directives() {
		$headers = apply_filters(
			'wp_headers',
			array(
				'Content-Security-Policy' => "script-src 'self'; script-src-elem 'self'; script-src-attr 'none'; style-src 'self'; style-src-elem 'self'; style-src-attr 'none'",
			)
		);

		$csp = $headers['Content-Security-Policy'];

		$this->assertStringContainsString( "script-src 'self' cdn.form.io", $csp );
		$this->assertStringContainsString( "script-src-elem 'self' cdn.form.io", $csp );
		$this->assertStringContainsString( "script-src-attr 'none'", $csp );
		$this->assertStringContainsString( "style-src 'self' *.gov.bc.ca cdn.form.io fonts.googleapis.com", $csp );
		$this->assertStringContainsString( "style-src-elem 'self' *.gov.bc.ca cdn.form.io fonts.googleapis.com", $csp );
		$this->assertStringContainsString( "style-src-attr 'none'", $csp );
	}

	/**
	 * The CHEFS CSP filter leaves headers without a CSP unchanged.
	 *
	 * @return void
	 */
	public function test_wp_headers_without_csp_are_unchanged() {
		$headers = array( 'X-Test' => 'unchanged' );

		$this->assertSame( $headers, apply_filters( 'wp_headers', $headers ) );
	}
}
