<?php
/**
 * Integration tests for CHEFS credentials storage (DSWP-1034).
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
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- internal table name.
		$wpdb->query( 'DELETE FROM ' . CredentialsManager::table_name() );
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

		$this->assertTrue( $this->table_exists() );

		$row = CredentialsManager::get_by_form_id( $this->form_id );
		$this->assertIsArray( $row );
		$this->assertSame( 'persist-me', $row['api_key'] );
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
}
