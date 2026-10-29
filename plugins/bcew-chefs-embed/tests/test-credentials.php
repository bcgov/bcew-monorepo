<?php
/**
 * Integration tests for CHEFS credentials storage
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

use Bcgov\BcewChefsEmbed\CredentialsManager;

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
}
