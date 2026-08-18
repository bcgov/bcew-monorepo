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

		require_once __DIR__ . '/wp-multisite-stubs.php';

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
	 * Empty credentials IDs are rejected before querying.
	 *
	 * @return void
	 */
	public function test_get_confirmation_rejects_empty_id() {
		$this->assertNull( OptionsManager::get_confirmation( '' ) );
		$this->assertNull( OptionsManager::get_confirmation( '   ' ) );
	}

	/**
	 * New-site hook installs the table for a site-like object.
	 *
	 * @return void
	 */
	public function test_on_initialize_site_installs_table() {
		$site = (object) array(
			'blog_id' => \get_current_blog_id(),
		);

		delete_option( OptionsManager::DB_VERSION_OPTION );
		OptionsManager::on_initialize_site( $site );

		$this->assertTrue( $this->table_exists() );
		$this->assertSame(
			OptionsManager::DB_VERSION,
			get_option( OptionsManager::DB_VERSION_OPTION )
		);
	}

	/**
	 * New-site hook ignores non-site values.
	 *
	 * @return void
	 */
	public function test_on_initialize_site_ignores_invalid_site() {
		OptionsManager::on_initialize_site( null );
		OptionsManager::on_initialize_site( 'not-a-site' );
		OptionsManager::on_initialize_site( (object) array() );

		$this->assertTrue( $this->table_exists() );
	}

	/**
	 * Install_for_blog switches context then creates the table.
	 *
	 * @return void
	 */
	public function test_install_for_blog_creates_table() {
		delete_option( OptionsManager::DB_VERSION_OPTION );
		unset( $GLOBALS['bcew_chefs_embed_switched_blog'] );

		$blog_id = \get_current_blog_id();
		OptionsManager::install_for_blog( $blog_id );

		$this->assertTrue( $this->table_exists() );
		$this->assertSame(
			OptionsManager::DB_VERSION,
			get_option( OptionsManager::DB_VERSION_OPTION )
		);
		// Stubs (or real multisite) should leave restore clearing the switch marker.
		$this->assertArrayNotHasKey( 'bcew_chefs_embed_switched_blog', $GLOBALS );
	}

	/**
	 * Install_on_sites installs for each provided blog ID.
	 *
	 * @return void
	 */
	public function test_install_on_sites_creates_table() {
		delete_option( OptionsManager::DB_VERSION_OPTION );

		OptionsManager::install_on_sites( array( \get_current_blog_id() ) );

		$this->assertTrue( $this->table_exists() );
		$this->assertSame(
			OptionsManager::DB_VERSION,
			get_option( OptionsManager::DB_VERSION_OPTION )
		);
	}

	/**
	 * Network-wide activation installs via the site ID list.
	 *
	 * @return void
	 */
	public function test_activate_network_wide_installs() {
		delete_option( OptionsManager::DB_VERSION_OPTION );

		OptionsManager::activate( true );

		$this->assertTrue( $this->table_exists() );
		$this->assertSame(
			OptionsManager::DB_VERSION,
			get_option( OptionsManager::DB_VERSION_OPTION )
		);
	}

	/**
	 * Site ID helper returns at least the current blog.
	 *
	 * @return void
	 */
	public function test_site_ids_for_network_install_includes_current_blog() {
		$site_ids = OptionsManager::site_ids_for_network_install();

		$this->assertContains( \get_current_blog_id(), $site_ids );
	}

	/**
	 * The plugins_loaded helper installs when the schema version is missing.
	 *
	 * @return void
	 */
	public function test_maybe_install_options_table_when_version_missing() {
		delete_option( OptionsManager::DB_VERSION_OPTION );

		bcew_chefs_embed_maybe_install_options_table();

		$this->assertTrue( $this->table_exists() );
		$this->assertSame(
			OptionsManager::DB_VERSION,
			get_option( OptionsManager::DB_VERSION_OPTION )
		);
	}

	/**
	 * The plugins_loaded helper is a no-op when the schema is current.
	 *
	 * @return void
	 */
	public function test_maybe_install_options_table_skips_when_current() {
		OptionsManager::install();
		$this->insert_option_row( $this->form_id, 'Keep me' );

		bcew_chefs_embed_maybe_install_options_table();

		$this->assertSame( 'Keep me', OptionsManager::get_confirmation( $this->form_id ) );
		$this->assertSame(
			OptionsManager::DB_VERSION,
			get_option( OptionsManager::DB_VERSION_OPTION )
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
	 * Save creates a confirmation message for a form.
	 *
	 * @return void
	 */
	public function test_save_creates_confirmation() {
		$result = OptionsManager::save( $this->form_id, 'Thanks for submitting!' );

		$this->assertSame( $this->form_id, $result );
		$this->assertSame( 'Thanks for submitting!', OptionsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Saving the same form ID again updates the existing message.
	 *
	 * @return void
	 */
	public function test_save_updates_existing_confirmation() {
		OptionsManager::save( $this->form_id, 'First message' );
		$result = OptionsManager::save( $this->form_id, 'Updated message' );

		$this->assertSame( $this->form_id, $result );
		$this->assertSame( 'Updated message', OptionsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Empty form ID or empty message is rejected and does not clear an existing row.
	 *
	 * @return void
	 */
	public function test_save_rejects_empty_values() {
		OptionsManager::save( $this->form_id, 'Keep me' );

		$this->assertFalse( OptionsManager::save( '', 'Thanks' ) );
		$this->assertFalse( OptionsManager::save( $this->form_id, '' ) );
		$this->assertFalse( OptionsManager::save( $this->form_id, '   ' ) );
		$this->assertSame( 'Keep me', OptionsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Multiline confirmation text keeps newlines.
	 *
	 * @return void
	 */
	public function test_save_preserves_newlines() {
		$message = "Line one.\nLine two.";

		OptionsManager::save( $this->form_id, $message );

		$this->assertSame( $message, OptionsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Delete removes the confirmation so lookups fall back to generic.
	 *
	 * @return void
	 */
	public function test_delete_removes_confirmation() {
		OptionsManager::save( $this->form_id, 'Thanks for submitting!' );

		$this->assertTrue( OptionsManager::delete( $this->form_id ) );
		$this->assertNull( OptionsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Delete returns false when the ID is empty or no row exists.
	 *
	 * @return void
	 */
	public function test_delete_returns_false_when_nothing_to_remove() {
		$this->assertFalse( OptionsManager::delete( '' ) );
		$this->assertFalse( OptionsManager::delete( $this->form_id ) );
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
