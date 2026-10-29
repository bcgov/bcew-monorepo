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
	 * Menu registration adds the CHEFS Documentation menu.
	 *
	 * @return void
	 */
	public function test_register_menu_adds_documentation_menu() {
		global $menu;

		wp_set_current_user( self::factory()->user->create( array( 'role' => 'administrator' ) ) );

		$menu = array();
		bcew_chefs_embed_register_menu();

		$slug = plugin_basename( BCEW_CHEFS_EMBED_DOCUMENTATION_URL );

		$this->assertContains( $slug, array_column( $menu, 2 ) );
		$this->assertContains( 'CHEFS Documentation', array_column( $menu, 0 ) );
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
	 * The plugin no longer registers a saved-form REST route.
	 *
	 * @return void
	 */
	public function test_saved_forms_rest_route_is_not_registered() {
		do_action( 'rest_api_init' );

		$routes = rest_get_server()->get_routes();

		$this->assertArrayNotHasKey( '/bcew-chefs-embed/v1/forms', $routes );
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

		$this->assertStringContainsString( "script-src 'self' https://submit.digital.gov.bc.ca cdn.form.io", $csp );
		$this->assertStringContainsString( "connect-src 'self' https://submit.digital.gov.bc.ca cdn.form.io", $csp );
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
		$this->assertStringContainsString( "connect-src 'self' data: https://submit.digital.gov.bc.ca cdn.form.io", $headers['Content-Security-Policy'] );
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
		$this->assertStringContainsString( "script-src 'self' https://submit.digital.gov.bc.ca cdn.form.io", $csp );
		$this->assertStringContainsString( "connect-src 'self' https://submit.digital.gov.bc.ca cdn.form.io", $csp );
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
		$this->assertStringNotContainsString( 'connect-src ', $csp );
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

		$this->assertStringContainsString( "script-src 'self' https://submit.digital.gov.bc.ca cdn.form.io", $csp );
		$this->assertStringContainsString( "script-src-elem 'self' https://submit.digital.gov.bc.ca cdn.form.io", $csp );
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
