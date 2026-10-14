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
	 * Activate plugin and initialize REST API.
	 *
	 * @return void
	 */
	private function activate_and_init_rest() {
		activate_plugin( 'bcew-chefs-embed/bcew-chefs-embed.php' );
		do_action( 'rest_api_init' );
	}

	/**
	 * Run a callback with an HTTP mock active, then remove the mock.
	 *
	 * @param callable $http_callback Mock HTTP handler.
	 * @param callable $callback Callback to run while mock is active.
	 * @return void
	 */
	private function with_http_mock( $http_callback, $callback ) {
		add_filter( 'pre_http_request', $http_callback, 10, 3 );
		try {
			$callback();
		} finally {
			remove_filter( 'pre_http_request', $http_callback );
		}
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
		$this->assertArrayHasKey( 'form_name', $by_name );
		$this->assertArrayHasKey( 'confirmation', $by_name );
		$this->assertArrayHasKey( 'created_at', $by_name );
		$this->assertArrayHasKey( 'user_id', $by_name );

		$this->assertSame( 'PRI', $by_name['form_id']['Key'] );
	}

	/**
	 * A site that still has the old options table keeps its saved form on load.
	 *
	 * @return void
	 */
	public function test_legacy_options_are_copied_onto_the_form_row() {
		global $wpdb;

		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		CredentialsManager::save( $this->form_id, 'test-api-key-value', $user_id );

		$table = CredentialsManager::table_name();
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- test schema; table name from code.
		$wpdb->query( "ALTER TABLE `{$table}` DROP COLUMN form_name, DROP COLUMN confirmation" );
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		update_option( CredentialsManager::DB_VERSION_OPTION, '1' );

		$options_table = $wpdb->prefix . 'bcew_chefs_options';
		$charset       = $wpdb->get_charset_collate();
		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- test schema; table name from code.
		$wpdb->query(
			"CREATE TABLE `{$options_table}` (
				id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
				chefs_credentials_id varchar(36) NOT NULL,
				form_name varchar(255) NOT NULL DEFAULT '',
				confirmation longtext NOT NULL,
				PRIMARY KEY (id)
			) {$charset}"
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$wpdb->insert(
			$options_table,
			array(
				'chefs_credentials_id' => $this->form_id,
				'form_name'            => 'Permit form',
				'confirmation'         => 'Thanks for applying.',
			),
			array( '%s', '%s', '%s' )
		);
		update_option( 'bcew_chefs_options_db_version', '4' );

		CredentialsManager::migrate_legacy_options_table();

		$found = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $options_table ) ) );
		$this->assertNull( $found );
		$this->assertFalse( get_option( 'bcew_chefs_options_db_version' ) );
		$this->assertSame( 'Permit form', CredentialsManager::get_form_name( $this->form_id ) );
		$this->assertSame( 'Thanks for applying.', CredentialsManager::get_confirmation( $this->form_id ) );
		$this->assertSame( 'test-api-key-value', CredentialsManager::get_by_form_id( $this->form_id )['api_key'] );

		CredentialsManager::migrate_legacy_options_table();
		$this->assertSame( 'Permit form', CredentialsManager::get_form_name( $this->form_id ) );
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
	 * Build expected form data object for REST response assertions.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @return array
	 */
	private function get_expected_form_data( $form_id ) {
		return array(
			'form_id'    => $form_id,
			'form_name'  => '',
			'created_at' => $this->get_saved_form_created_at( $form_id ),
		);
	}

	/**
	 * Saved CHEFS forms are exposed through the REST API for users who can edit posts.
	 *
	 * @return void
	 */
	public function test_rest_route_returns_saved_forms() {
		$user_id = self::factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $user_id );

		$this->activate_and_init_rest();

		CredentialsManager::install();
		CredentialsManager::save( $this->form_id, 'test-api-key-value', $user_id );
		$second_form_id = 'deadbeef-1234-5678-90ab-cdef12345678';
		CredentialsManager::save( $second_form_id, 'another-test-key', $user_id );

		$request  = new \WP_REST_Request( 'GET', '/bcew-chefs-embed/v1/forms' );
		$response = rest_do_request( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertCount( 2, $response->get_data() );

		foreach ( $response->get_data() as $form ) {
			$this->assertIsString( $form['form_id'] );
			$this->assertNotEmpty( $form['form_id'] );
			$this->assertArrayHasKey( 'form_name', $form );
			// The API key should not be exposed in the REST response.
			$this->assertArrayNotHasKey( 'api_key', $form );
		}
	}

	/**
	 * Get the stored creation time for REST response assertions.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @return string
	 */
	private function get_saved_form_created_at( $form_id ) {
		global $wpdb;

		$table = CredentialsManager::table_name();

		return (string) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT created_at FROM %i WHERE form_id = %s',
				$table,
				$form_id
			)
		);
	}

	/**
	 * REST route returns an empty list when no forms are saved.
	 *
	 * @return void
	 */
	public function test_rest_route_returns_empty_list_when_no_saved_forms() {
		$user_id = self::factory()->user->create( array( 'role' => 'author' ) );
		wp_set_current_user( $user_id );

		$this->activate_and_init_rest();

		$request  = new \WP_REST_Request( 'GET', '/bcew-chefs-embed/v1/forms' );
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
	public function test_forms_route_blocks_users_without_edit_posts_capability() {
		$user_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $user_id );

		$this->activate_and_init_rest();

		CredentialsManager::install();
		CredentialsManager::save( $this->form_id, 'test-api-key-value', $user_id );

		$request  = new \WP_REST_Request( 'GET', '/bcew-chefs-embed/v1/forms' );
		$response = rest_do_request( $request );

		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 'rest_forbidden', $response->get_data()['code'] );
	}

	/**
	 * REST route denies access to logged-out visitors.
	 *
	 * @return void
	 */
	public function test_forms_route_blocks_logged_out_users() {
		wp_set_current_user( 0 );

		$this->activate_and_init_rest();

		$request  = new \WP_REST_Request( 'GET', '/bcew-chefs-embed/v1/forms' );
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
	 * Register the built chefs-form block with its real render template.
	 *
	 * Other tests replace the registration with a stub, so reset it here.
	 *
	 * @return void
	 */
	private function register_built_block() {
		$registry = \WP_Block_Type_Registry::get_instance();
		if ( $registry->is_registered( 'bcew-chefs-embed/chefs-form' ) ) {
			$registry->unregister( 'bcew-chefs-embed/chefs-form' );
		}

		register_block_type_from_metadata( dirname( __DIR__ ) . '/dist/chefs-form' );
	}

	/**
	 * Mock a successful CHEFS token response.
	 *
	 * @return callable
	 */
	private function chefs_token_mock() {
		return function ( $preempt, $parsed_args, $url ) {
			$this->assertStringContainsString( '/auth/token/forms/' . rawurlencode( $this->form_id ), $url );

			return array(
				'headers'  => array( 'content-type' => 'application/json' ),
				'body'     => wp_json_encode( array( 'token' => 'chefs-token-123' ) ),
				'response' => array(
					'code'    => 200,
					'message' => 'OK',
				),
			);
		};
	}

	/**
	 * The embed-config REST route no longer exists.
	 *
	 * @return void
	 */
	public function test_embed_config_route_is_not_registered() {
		$this->activate_and_init_rest();

		$routes = rest_get_server()->get_routes();

		$this->assertArrayNotHasKey( '/bcew-chefs-embed/v1/embed-config', $routes );
	}

	/**
	 * Rendering the block adds the token and confirmation without exposing the API key.
	 *
	 * @return void
	 */
	public function test_block_render_adds_token_and_confirmation_without_exposing_api_key() {
		$this->register_built_block();
		$user_id = self::factory()->user->create( array( 'role' => 'author' ) );
		CredentialsManager::install();
		CredentialsManager::save( $this->form_id, 'test-api-key-value', $user_id );
		CredentialsManager::save_confirmation( $this->form_id, 'Thanks for applying.' );

		$this->with_http_mock(
			$this->chefs_token_mock(),
			function () {
				$html = render_block(
					array(
						'blockName'    => 'bcew-chefs-embed/chefs-form',
						'attrs'        => array( 'formId' => $this->form_id ),
						'innerBlocks'  => array(),
						'innerHTML'    => '',
						'innerContent' => array(),
					)
				);

				$this->assertStringContainsString( 'auth-token="chefs-token-123"', $html );
				$this->assertStringContainsString( 'form-id="' . $this->form_id . '"', $html );
				$this->assertStringContainsString( 'data-confirmation="Thanks for applying."', $html );
				$this->assertStringNotContainsString( 'test-api-key-value', $html );
			}
		);
	}

	/**
	 * An unknown Form ID gets no token and shows a load error.
	 *
	 * @return void
	 */
	public function test_block_render_unknown_form_id_has_no_token() {
		$this->register_built_block();
		CredentialsManager::install();

		$http_calls = 0;
		$this->with_http_mock(
			function () use ( &$http_calls ) {
				++$http_calls;
				return new \WP_Error( 'unexpected' );
			},
			function () {
				$html = render_block(
					array(
						'blockName'    => 'bcew-chefs-embed/chefs-form',
						'attrs'        => array( 'formId' => '00000000-0000-0000-0000-000000000000' ),
						'innerBlocks'  => array(),
						'innerHTML'    => '',
						'innerContent' => array(),
					)
				);

				$this->assertStringNotContainsString( 'auth-token', $html );
				$this->assertStringContainsString( 'bcew-chefs-form__error', $html );
			}
		);

		$this->assertSame( 0, $http_calls );
	}

	/**
	 * Removing credentials also removes the confirmation for that form.
	 *
	 * @return void
	 */
	public function test_deleting_credentials_also_deletes_confirmation() {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		CredentialsManager::save( $this->form_id, 'test-api-key-value', $user_id );
		CredentialsManager::install();
		CredentialsManager::save_confirmation( $this->form_id, 'Thanks for applying.' );

		$this->assertSame( 'Thanks for applying.', CredentialsManager::get_confirmation( $this->form_id ) );

		CredentialsManager::delete( $this->form_id );

		$this->assertNull( CredentialsManager::get_by_form_id( $this->form_id ) );
		$this->assertNull( CredentialsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Render the CHEFS Form block template with the given Form ID attribute.
	 *
	 * @param string $form_id Form ID attribute value.
	 * @return string Rendered HTML.
	 */
	private function render_chefs_form_template( $form_id ) {
		$attributes = array(
			'formId' => $form_id,
		);
		$content    = '';
		$block      = null;
		$template   = dirname( __DIR__ ) . '/src/chefs-form/render.php';

		$this->assertFileExists( $template );

		ob_start();
		// phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable -- Test loads the block render template by absolute path.
		require $template;

		return (string) ob_get_clean();
	}

	/**
	 * Frontend block markup does not expose the API key.
	 *
	 * @return void
	 */
	public function test_block_render_outputs_form_id_without_secrets() {
		$form_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
		$api_key = 'super-secret-api-key-value';

		CredentialsManager::install();
		CredentialsManager::save( $form_id, $api_key, get_current_user_id() );

		$html = $this->render_chefs_form_template( $form_id );

		$this->assertStringContainsString( 'data-form-id="' . $form_id . '"', $html );
		$this->assertStringNotContainsString( $api_key, $html );
		$this->assertStringNotContainsString( 'api_key', $html );
		$this->assertStringNotContainsString( 'api-key', $html );
	}

	/**
	 * Empty Form ID renders a clear empty state without secrets.
	 *
	 * @return void
	 */
	public function test_block_render_empty_form_id_shows_placeholder() {
		$html = $this->render_chefs_form_template( '' );

		$this->assertStringContainsString( 'data-form-id=""', $html );
		$this->assertStringContainsString( 'No CHEFS form selected.', $html );
		$this->assertStringNotContainsString( 'bcew-chefs-form__mount', $html );
	}
}
