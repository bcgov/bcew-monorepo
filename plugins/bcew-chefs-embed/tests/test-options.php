<?php
/**
 * Integration tests for CHEFS options storage (DSWP-1152).
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

use Bcgov\BcewChefsEmbed\OptionsManager;

/**
 * Options table acceptance criteria.
 */
class OptionsTest extends \WP_UnitTestCase {

	/**
	 * Sample CHEFS form UUID used as chefs_credentials_id.
	 *
	 * @var string
	 */
	private $form_id = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

	/**
	 * Ensure the table exists and clear rows before each test.
	 *
	 * @return void
	 */
	public function set_up() {
		parent::set_up();

		OptionsManager::install();

		global $wpdb;

		$table = OptionsManager::table_name();
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- internal table name.
		$wpdb->query( "DELETE FROM `{$table}`" );
	}

	/**
	 * Whether the options table exists for the current site.
	 *
	 * @return bool
	 */
	private function table_exists() {
		global $wpdb;

		$table = OptionsManager::table_name();
		$found = $wpdb->get_var(
			$wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $table ) )
		);

		return $found === $table;
	}

	/**
	 * Insert a confirmation row for tests.
	 *
	 * @param string $chefs_credentials_id Form / credentials ID.
	 * @param string $confirmation Confirmation text.
	 * @return int|false Insert ID or false on failure.
	 */
	private function insert_option_row( $chefs_credentials_id, $confirmation ) {
		global $wpdb;

		$result = $wpdb->insert(
			OptionsManager::table_name(),
			array(
				'chefs_credentials_id' => $chefs_credentials_id,
				'confirmation'         => $confirmation,
			),
			array( '%s', '%s' )
		);

		return false === $result ? false : (int) $wpdb->insert_id;
	}

	/**
	 * Custom table is created on plugin activation if it does not already exist.
	 *
	 * @return void
	 */
	public function test_table_created_on_activation() {
		OptionsManager::activate( false );

		$this->assertTrue( $this->table_exists(), 'Activation should create the options table.' );

		// Safe when the table already exists.
		OptionsManager::activate( false );
		$this->assertTrue( $this->table_exists() );
	}

	/**
	 * Table schema matches the ticket (id PK, chefs_credentials_id, confirmation).
	 *
	 * @return void
	 */
	public function test_table_schema_matches_acceptance_criteria() {
		global $wpdb;

		$table   = OptionsManager::table_name();
		$columns = $wpdb->get_results( "DESCRIBE `{$table}`", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- internal table name.

		$this->assertNotEmpty( $columns );

		$by_field = array();
		foreach ( $columns as $column ) {
			$by_field[ $column['Field'] ] = $column;
		}

		$this->assertArrayHasKey( 'id', $by_field );
		$this->assertSame( 'PRI', $by_field['id']['Key'] );
		$this->assertStringContainsString( 'auto_increment', strtolower( $by_field['id']['Extra'] ) );

		$this->assertArrayHasKey( 'chefs_credentials_id', $by_field );
		$this->assertArrayHasKey( 'confirmation', $by_field );
	}

	/**
	 * Confirmation can be looked up by form / credentials ID.
	 *
	 * @return void
	 */
	public function test_get_confirmation_by_credentials_id() {
		$this->insert_option_row( $this->form_id, 'Thanks for submitting!' );

		$this->assertSame(
			'Thanks for submitting!',
			OptionsManager::get_confirmation( $this->form_id )
		);
		$this->assertNull(
			OptionsManager::get_confirmation( '00000000-0000-0000-0000-000000000000' )
		);
	}

	/**
	 * Plugin deactivation should not delete options data.
	 *
	 * @return void
	 */
	public function test_deactivation_does_not_delete_data() {
		OptionsManager::install();
		$this->insert_option_row( $this->form_id, 'Persist me' );

		$plugin = 'bcew-chefs-embed/bcew-chefs-embed.php';
		activate_plugin( $plugin );
		deactivate_plugins( $plugin );

		try {
			$this->assertTrue( $this->table_exists() );
			$this->assertSame( 'Persist me', OptionsManager::get_confirmation( $this->form_id ) );
		} finally {
			activate_plugin( $plugin );
		}
	}

	/**
	 * Plugin re-activation should not delete options data.
	 *
	 * @return void
	 */
	public function test_reactivation_does_not_delete_data() {
		OptionsManager::install();
		$this->insert_option_row( $this->form_id, 'Still here' );

		$plugin = 'bcew-chefs-embed/bcew-chefs-embed.php';
		activate_plugin( $plugin );
		deactivate_plugins( $plugin );
		activate_plugin( $plugin );
		OptionsManager::activate( false );

		$this->assertTrue( $this->table_exists() );
		$this->assertSame( 'Still here', OptionsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Install uses the current blog table prefix (regular / network site support).
	 *
	 * @return void
	 */
	public function test_install_uses_current_site_table_prefix() {
		global $wpdb;

		OptionsManager::install();

		$this->assertStringStartsWith( $wpdb->prefix, OptionsManager::table_name() );
		$this->assertTrue( $this->table_exists() );
	}

	/**
	 * Network-wide activation installs the table for each site when multisite.
	 *
	 * @return void
	 */
	public function test_network_activation_creates_table_on_each_site() {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Multisite is required for network activation coverage.' );
		}

		$site_ids = get_sites(
			array(
				'fields' => 'ids',
				'number' => 0,
			)
		);

		OptionsManager::activate( true );

		foreach ( $site_ids as $site_id ) {
			switch_to_blog( (int) $site_id );
			$this->assertTrue( $this->table_exists() );
			restore_current_blog();
		}
	}
}
