<?php
/**
 * Integration tests for CHEFS credentials storage
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

use Bcgov\BcewChefsEmbed\CredentialsManager;
use Bcgov\BcewChefsEmbed\Settings;

/**
 * Credentials table acceptance criteria.
 */
class CredentialsTest extends \WP_UnitTestCase {

	/**
	 * Sample CHEFS form UUID.
	 *
	 * @var string
	 */
	private $form_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

	/**
	 * Ensure the table exists and clear rows before each test.
	 *
	 * @return void
	 */
	public function set_up() {
		parent::set_up();

		CredentialsManager::install();

		global $wpdb;

		$table = CredentialsManager::table_name();
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- internal table name.
		$wpdb->query( "DELETE FROM `{$table}`" );
	}

	/**
	 * Whether the credentials table exists for the current site.
	 *
	 * @return bool
	 */
	private function table_exists() {
		global $wpdb;

		$table = CredentialsManager::table_name();
		$found = $wpdb->get_var(
			$wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $table ) )
		);

		return $found === $table;
	}

	/**
	 * Custom table is created on plugin activation if it does not already exist.
	 *
	 * @return void
	 */
	public function test_table_created_on_activation() {
		CredentialsManager::activate( false );

		$this->assertTrue( $this->table_exists(), 'Activation should create the credentials table.' );

		// Safe when the table already exists.
		CredentialsManager::activate( false );
		$this->assertTrue( $this->table_exists() );
	}

	/**
	 * Table schema matches the ticket (form_id PK, api_key, created_at, user_id).
	 *
	 * @return void
	 */
	public function test_table_schema_matches_acceptance_criteria() {
		global $wpdb;

		CredentialsManager::install();

		$table   = CredentialsManager::table_name();
		$columns = $wpdb->get_results( "DESCRIBE {$table}", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$this->assertNotEmpty( $columns );

		$by_name = array();
		foreach ( $columns as $column ) {
			$by_name[ $column['Field'] ] = $column;
		}

		$this->assertArrayHasKey( 'form_id', $by_name );
		$this->assertArrayHasKey( 'api_key', $by_name );
		$this->assertArrayHasKey( 'created_at', $by_name );
		$this->assertArrayHasKey( 'user_id', $by_name );

		$this->assertSame( 'PRI', $by_name['form_id']['Key'] );
	}

	/**
	 * Credentials can be looked up by Form ID (primary key).
	 *
	 * @return void
	 */
	public function test_credentials_can_be_looked_up_by_form_id() {
		CredentialsManager::install();

		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$saved = CredentialsManager::save( $this->form_id, 'test-api-key-value', $user_id );
		$this->assertSame( $this->form_id, $saved );

		$row = CredentialsManager::get_by_form_id( $this->form_id );
		$this->assertIsArray( $row );
		$this->assertSame( $this->form_id, $row['form_id'] );
		$this->assertSame( 'test-api-key-value', $row['api_key'] );
		$this->assertSame( $user_id, $row['user_id'] );
		$this->assertNotEmpty( $row['created_at'] );
	}

	/**
	 * Saved CHEFS form IDs are exposed through the REST API for users who can edit posts.
	 *
	 * @return void
	 */
	public function test_rest_route_returns_saved_form_ids() {
		$user_id = self::factory()->user->create( array( 'role' => 'author' ) );
		wp_set_current_user( $user_id );

		activate_plugin( 'bcew-chefs-embed/bcew-chefs-embed.php' );
		do_action( 'rest_api_init' );

		CredentialsManager::install();
		CredentialsManager::save( $this->form_id, 'test-api-key-value', $user_id );
		$second_form_id = 'deadbeef-1234-5678-90ab-cdef12345678';
		CredentialsManager::save( $second_form_id, 'another-test-key', $user_id );

		$request  = new \WP_REST_Request( 'GET', '/bcew-chefs-embed/v1/form-ids' );
		$response = rest_do_request( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertEqualsCanonicalizing( array( $this->form_id, $second_form_id ), $response->get_data() );

		foreach ( $response->get_data() as $saved_form_id ) {
			$this->assertIsString( $saved_form_id );
			$this->assertNotEmpty( $saved_form_id );
		}
	}

	/**
	 * REST route returns an empty list when no forms are saved.
	 *
	 * @return void
	 */
	public function test_rest_route_returns_empty_list_when_no_saved_form_ids() {
		$user_id = self::factory()->user->create( array( 'role' => 'author' ) );
		wp_set_current_user( $user_id );

		activate_plugin( 'bcew-chefs-embed/bcew-chefs-embed.php' );
		do_action( 'rest_api_init' );

		$request  = new \WP_REST_Request( 'GET', '/bcew-chefs-embed/v1/form-ids' );
		$response = rest_do_request( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( array(), $response->get_data() );
	}

	/**
	 * The editor script receives the settings page URL used by the no-forms message link.
	 *
	 * @return void
	 */
	public function test_editor_script_has_inline_settings_url_config() {
		$registry = \WP_Block_Type_Registry::get_instance();
		if ( $registry->is_registered( 'bcew-chefs-embed/chefs-form' ) ) {
			$registry->unregister( 'bcew-chefs-embed/chefs-form' );
		}

		wp_register_script( 'bcew-chefs-embed-test-editor-script', false, array(), '1.0.0', true );
		register_block_type(
			'bcew-chefs-embed/chefs-form',
			array(
				'editor_script' => 'bcew-chefs-embed-test-editor-script',
			)
		);

		bcew_chefs_embed_register_editor_settings();

		$block_type = $registry->get_registered( 'bcew-chefs-embed/chefs-form' );

		$this->assertNotNull( $block_type );
		$this->assertNotEmpty( $block_type->editor_script_handles );

		$editor_script_handle = reset( $block_type->editor_script_handles );
		$this->assertIsString( $editor_script_handle );
		$this->assertNotSame( '', $editor_script_handle );

		$inline_scripts = wp_scripts()->get_data( $editor_script_handle, 'before' );

		$this->assertNotFalse( $inline_scripts );
		$this->assertIsArray( $inline_scripts );
		$this->assertNotEmpty( $inline_scripts );

		$inline_script = implode( "\n", $inline_scripts );

		$this->assertStringContainsString( 'window.bcewChefsEmbedSettings', $inline_script );
		$this->assertStringContainsString( 'settingsUrl', $inline_script );
		$this->assertStringContainsString( Settings::PAGE_SLUG, $inline_script );

		$registry->unregister( 'bcew-chefs-embed/chefs-form' );
	}

	/**
	 * REST route denies access to users without the edit_posts capability.
	 *
	 * @return void
	 */
	public function test_rest_route_blocks_users_without_edit_posts_capability() {
		$user_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $user_id );

		activate_plugin( 'bcew-chefs-embed/bcew-chefs-embed.php' );
		do_action( 'rest_api_init' );

		CredentialsManager::install();
		CredentialsManager::save( $this->form_id, 'test-api-key-value', $user_id );

		$request  = new \WP_REST_Request( 'GET', '/bcew-chefs-embed/v1/form-ids' );
		$response = rest_do_request( $request );

		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 'rest_forbidden', $response->get_data()['code'] );
	}

	/**
	 * Plugin deactivation should not delete credentials data.
	 *
	 * @return void
	 */
	public function test_deactivation_does_not_delete_data() {
		CredentialsManager::install();

		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		CredentialsManager::save( $this->form_id, 'persist-me', $user_id );

		$plugin = 'bcew-chefs-embed/bcew-chefs-embed.php';
		activate_plugin( $plugin );
		deactivate_plugins( $plugin );

		try {
			$this->assertTrue( $this->table_exists() );

			$row = CredentialsManager::get_by_form_id( $this->form_id );
			$this->assertIsArray( $row );
			$this->assertSame( 'persist-me', $row['api_key'] );
		} finally {
			// Leave the shared wp-env tests site active for e2e / manual checks.
			activate_plugin( $plugin );
		}
	}

	/**
	 * Install uses the current blog table prefix (regular / network site support).
	 *
	 * @return void
	 */
	public function test_install_uses_current_site_table_prefix() {
		global $wpdb;

		CredentialsManager::install();

		$this->assertStringStartsWith( $wpdb->prefix, CredentialsManager::table_name() );
		$this->assertTrue( $this->table_exists() );
	}

	/**
	 * Network-wide activation installs the table for each site when multisite.
	 *
	 * @group ms-required
	 * @return void
	 */
	public function test_network_activation_creates_table_on_each_site() {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Multisite is required for network activation coverage.' );
		}

		$blog_id = self::factory()->blog->create();

		CredentialsManager::activate( true );

		switch_to_blog( $blog_id );
		$this->assertTrue( $this->table_exists() );
		restore_current_blog();

		$this->assertTrue( $this->table_exists() );
	}

	/**
	 * Embed config REST route returns an error for an unknown Form ID.
	 *
	 * @return void
	 */
	public function test_embed_config_route_returns_token_and_base_url_without_exposing_api_key() {
		$user_id = self::factory()->user->create( array( 'role' => 'author' ) );
		wp_set_current_user( $user_id );

		activate_plugin( 'bcew-chefs-embed/bcew-chefs-embed.php' );
		do_action( 'rest_api_init' );

		CredentialsManager::install();
		CredentialsManager::save( $this->form_id, 'test-api-key-value', $user_id );

		$http_callback = function ( $preempt, $parsed_args, $url ) {
			$this->assertStringContainsString( '/auth/token/forms/' . rawurlencode( $this->form_id ), $url );
			$this->assertSame(
				// phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode -- Required to validate the HTTP Basic auth header used for the CHEFS token request.
				'Basic ' . base64_encode( $this->form_id . ':test-api-key-value' ),
				$parsed_args['headers']['Authorization']
			);

			return array(
				'headers'  => array( 'content-type' => 'application/json' ),
				'body'     => wp_json_encode( array( 'token' => 'chefs-token-123' ) ),
				'response' => array(
					'code'    => 200,
					'message' => 'OK',
				),
			);
		};

		add_filter( 'pre_http_request', $http_callback, 10, 3 );

		try {
			$request = new \WP_REST_Request( 'GET', '/bcew-chefs-embed/v1/embed-config' );
			$request->set_param( 'formId', $this->form_id );
			$response = rest_do_request( $request );

			$this->assertSame( 200, $response->get_status() );
			$this->assertSame( 'chefs-token-123', $response->get_data()['token'] );
			$this->assertSame( 'https://submit.digital.gov.bc.ca/app', $response->get_data()['baseUrl'] );
			$this->assertArrayNotHasKey( 'apiKey', $response->get_data() );
			$this->assertArrayNotHasKey( 'api_key', $response->get_data() );
			$this->assertStringNotContainsString( 'test-api-key-value', wp_json_encode( $response->get_data() ) );
		} finally {
			remove_filter( 'pre_http_request', $http_callback );
		}
	}

	/**
	 * Embed config REST route returns an error for an unknown Form ID.
	 *
	 * @return void
	 */
	public function test_embed_config_route_returns_error_for_unknown_form_id() {
		activate_plugin( 'bcew-chefs-embed/bcew-chefs-embed.php' );
		do_action( 'rest_api_init' );

		CredentialsManager::install();

		$request = new \WP_REST_Request(
			'GET',
			'/bcew-chefs-embed/v1/embed-config'
		);

		$request->set_param( 'formId', '00000000-0000-0000-0000-000000000000' );

		$response = rest_do_request( $request );

		$this->assertSame( 404, $response->get_status() );
		$this->assertSame(
			'chefs_form_not_configured',
			$response->get_data()['code']
		);
	}
}
