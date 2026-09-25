<?php
/**
 * Integration tests for CHEFS options storage (DSWP-1152).
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

use Bcgov\BcewChefsEmbed\CredentialsManager;

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

		CredentialsManager::install();

		global $wpdb;

		$table = CredentialsManager::table_name();
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- internal table name.
		$wpdb->query( "DELETE FROM `{$table}`" );
		CredentialsManager::save( $this->form_id, 'seed-api-key', 1 );
	}

	/**
	 * Whether the options table exists for the current site.
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
	 * Insert a confirmation row for tests.
	 *
	 * @param string $chefs_credentials_id Form / credentials ID.
	 * @param string $confirmation Confirmation text.
	 * @return int|false Insert ID or false on failure.
	 */
	private function insert_option_row( $chefs_credentials_id, $confirmation ) {
		CredentialsManager::save( $chefs_credentials_id, 'seed-api-key', 1 );

		return CredentialsManager::save_confirmation( $chefs_credentials_id, $confirmation );
	}

	/**
	 * Get schema columns indexed by field name.
	 *
	 * @return array Columns keyed by field name.
	 */
	private function get_column_schema() {
		global $wpdb;

		$table   = CredentialsManager::table_name();
		$columns = $wpdb->get_results( "DESCRIBE `{$table}`", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- internal table name.

		$by_field = array();
		foreach ( $columns as $column ) {
			$by_field[ $column['Field'] ] = $column;
		}

		return $by_field;
	}

	/**
	 * Get a table value by credentials ID.
	 *
	 * @param string $column Column name.
	 * @param string $form_id Credentials ID.
	 * @return mixed|null Table value.
	 */
	private function get_table_value( $column, $form_id ) {
		global $wpdb;

		return $wpdb->get_var(
			$wpdb->prepare(
				'SELECT %i FROM %i WHERE form_id = %s',
				$column,
				CredentialsManager::table_name(),
				$form_id
			)
		);
	}

	/**
	 * Activation creates the options table.
	 *
	 * @return void
	 */
	public function test_table_created_on_activation() {
		CredentialsManager::activate( false );

		$this->assertTrue( $this->table_exists() );
		CredentialsManager::activate( false );
		$this->assertTrue( $this->table_exists() );
	}

	/**
	 * The options table contains the required columns.
	 *
	 * @return void
	 */
	public function test_table_schema_matches_acceptance_criteria() {
		$by_field = $this->get_column_schema();

		$this->assertNotEmpty( $by_field );
		$this->assertArrayHasKey( 'form_id', $by_field );
		$this->assertSame( 'PRI', $by_field['form_id']['Key'] );
		$this->assertArrayHasKey( 'api_key', $by_field );
		$this->assertArrayHasKey( 'form_name', $by_field );
		$this->assertArrayHasKey( 'confirmation', $by_field );
		$this->assertArrayHasKey( 'created_at', $by_field );
		$this->assertArrayHasKey( 'user_id', $by_field );
		$this->assertArrayNotHasKey( 'chefs_credentials_id', $by_field );
	}

	/**
	 * Form names can be saved independently of confirmations.
	 *
	 * @return void
	 */
	public function test_save_form_name() {
		$this->assertSame( $this->form_id, CredentialsManager::save_form_name( $this->form_id, ' Grant application ' ) );
		$this->assertSame( 'Grant application', $this->get_table_value( 'form_name', $this->form_id ) );
		$this->assertNull( CredentialsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Confirmations can be looked up by credentials ID.
	 *
	 * @return void
	 */
	public function test_get_confirmation_by_credentials_id() {
		$this->insert_option_row( $this->form_id, 'Thanks for submitting!' );

		$this->assertSame( 'Thanks for submitting!', CredentialsManager::get_confirmation( $this->form_id ) );
		$this->assertNull( CredentialsManager::get_confirmation( '00000000-0000-0000-0000-000000000000' ) );
	}

	/**
	 * Empty credentials IDs are rejected.
	 *
	 * @return void
	 */
	public function test_get_confirmation_rejects_empty_id() {
		$this->assertNull( CredentialsManager::get_confirmation( '' ) );
		$this->assertNull( CredentialsManager::get_confirmation( '   ' ) );
	}

	/**
	 * New-site initialization installs the options table.
	 *
	 * @return void
	 */
	public function test_on_initialize_site_installs_table() {
		$site = (object) array( 'blog_id' => \get_current_blog_id() );

		delete_option( CredentialsManager::DB_VERSION_OPTION );
		CredentialsManager::on_initialize_site( $site );

		$this->assertTrue( $this->table_exists() );
		$this->assertSame( CredentialsManager::DB_VERSION, get_option( CredentialsManager::DB_VERSION_OPTION ) );
	}

	/**
	 * New-site hook ignores non-site values.
	 *
	 * @return void
	 */
	public function test_on_initialize_site_ignores_invalid_site() {
		CredentialsManager::on_initialize_site( null );
		CredentialsManager::on_initialize_site( 'not-a-site' );
		CredentialsManager::on_initialize_site( (object) array() );

		$this->assertTrue( $this->table_exists() );
	}

	/**
	 * Install_for_blog switches context then creates the table.
	 *
	 * @return void
	 */
	public function test_install_for_blog_creates_table() {
		delete_option( CredentialsManager::DB_VERSION_OPTION );
		unset( $GLOBALS['bcew_chefs_embed_switched_blog'] );

		$blog_id = \get_current_blog_id();
		CredentialsManager::install_for_blog( $blog_id );

		$this->assertTrue( $this->table_exists() );
		$this->assertSame(
			CredentialsManager::DB_VERSION,
			get_option( CredentialsManager::DB_VERSION_OPTION )
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
		delete_option( CredentialsManager::DB_VERSION_OPTION );

		CredentialsManager::install_on_sites( array( \get_current_blog_id() ) );

		$this->assertTrue( $this->table_exists() );
		$this->assertSame(
			CredentialsManager::DB_VERSION,
			get_option( CredentialsManager::DB_VERSION_OPTION )
		);
	}

	/**
	 * Network-wide activation installs via the site ID list.
	 *
	 * @return void
	 */
	public function test_activate_network_wide_installs() {
		delete_option( CredentialsManager::DB_VERSION_OPTION );

		CredentialsManager::activate( true );

		$this->assertTrue( $this->table_exists() );
		$this->assertSame(
			CredentialsManager::DB_VERSION,
			get_option( CredentialsManager::DB_VERSION_OPTION )
		);
	}

	/**
	 * Site ID helper returns at least the current blog.
	 *
	 * @return void
	 */
	public function test_site_ids_for_network_install_includes_current_blog() {
		$site_ids = CredentialsManager::site_ids_for_network_install();

		$this->assertContains( \get_current_blog_id(), $site_ids );
	}

	/**
	 * The plugins_loaded helper installs when the schema version is missing.
	 *
	 * @return void
	 */
	public function test_maybe_install_options_table_when_version_missing() {
		delete_option( CredentialsManager::DB_VERSION_OPTION );

		bcew_chefs_embed_maybe_install_credentials_table();

		$this->assertTrue( $this->table_exists() );
		$this->assertSame(
			CredentialsManager::DB_VERSION,
			get_option( CredentialsManager::DB_VERSION_OPTION )
		);
	}

	/**
	 * The plugins_loaded helper is a no-op when the schema is current.
	 *
	 * @return void
	 */
	public function test_maybe_install_options_table_skips_when_current() {
		CredentialsManager::install();
		$this->insert_option_row( $this->form_id, 'Keep me' );

		bcew_chefs_embed_maybe_install_credentials_table();

		$this->assertSame( 'Keep me', CredentialsManager::get_confirmation( $this->form_id ) );
		$this->assertSame(
			CredentialsManager::DB_VERSION,
			get_option( CredentialsManager::DB_VERSION_OPTION )
		);
	}

	/**
	 * Plugin deactivation should not delete options data.
	 *
	 * @return void
	 */
	public function test_deactivation_does_not_delete_data() {
		CredentialsManager::install();
		$this->insert_option_row( $this->form_id, 'Persist me' );

		$plugin = 'bcew-chefs-embed/bcew-chefs-embed.php';
		activate_plugin( $plugin );
		deactivate_plugins( $plugin );

		try {
			$this->assertTrue( $this->table_exists() );
			$this->assertSame( 'Persist me', CredentialsManager::get_confirmation( $this->form_id ) );
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
		CredentialsManager::install();
		$this->insert_option_row( $this->form_id, 'Still here' );

		$plugin = 'bcew-chefs-embed/bcew-chefs-embed.php';
		activate_plugin( $plugin );
		deactivate_plugins( $plugin );
		activate_plugin( $plugin );
		CredentialsManager::activate( false );

		$this->assertTrue( $this->table_exists() );
		$this->assertSame( 'Still here', CredentialsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Save creates a confirmation message for a form.
	 *
	 * @return void
	 */
	public function test_save_creates_confirmation() {
		$result = CredentialsManager::save_confirmation( $this->form_id, 'Thanks for submitting!' );

		$this->assertSame( $this->form_id, $result );
		$this->assertSame( 'Thanks for submitting!', CredentialsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Saving the same form ID again updates the existing message.
	 *
	 * @return void
	 */
	public function test_save_updates_existing_confirmation() {
		CredentialsManager::save_confirmation( $this->form_id, 'First message' );
		$result = CredentialsManager::save_confirmation( $this->form_id, 'Updated message' );

		$this->assertSame( $this->form_id, $result );
		$this->assertSame( 'Updated message', CredentialsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Empty form ID or empty message is rejected and does not clear an existing row.
	 *
	 * @return void
	 */
	public function test_save_rejects_empty_values() {
		CredentialsManager::save_confirmation( $this->form_id, 'Keep me' );

		$this->assertFalse( CredentialsManager::save_confirmation( '', 'Thanks' ) );
		$this->assertFalse( CredentialsManager::save_confirmation( $this->form_id, '' ) );
		$this->assertFalse( CredentialsManager::save_confirmation( $this->form_id, '   ' ) );
		$this->assertSame( 'Keep me', CredentialsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Multiline confirmation text keeps newlines.
	 *
	 * @return void
	 */
	public function test_save_preserves_newlines() {
		$message = "Line one.\nLine two.";

		CredentialsManager::save_confirmation( $this->form_id, $message );

		$this->assertSame( $message, CredentialsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Hostile form IDs and confirmation messages are sanitized before storage.
	 *
	 * @return void
	 */
	public function test_save_sanitizes_hostile_values() {
		$hostile_form_id = $this->form_id . '<script>alert(1)</script>';
		$hostile_message = "<script>alert('hack')</script><b>Thanks</b>";

		$result = CredentialsManager::save_confirmation( $hostile_form_id, $hostile_message );

		$this->assertSame( $this->form_id, $result );
		$this->assertSame( 'Thanks', CredentialsManager::get_confirmation( $result ) );
		$this->assertStringNotContainsString( '<script>', $this->get_table_value( 'confirmation', $result ) );
	}

	/**
	 * Delete removes the confirmation so lookups fall back to generic.
	 *
	 * @return void
	 */
	public function test_delete_removes_confirmation() {
		CredentialsManager::save_confirmation( $this->form_id, 'Thanks for submitting!' );

		$this->assertTrue( CredentialsManager::delete( $this->form_id ) );
		$this->assertNull( CredentialsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Clearing a confirmation preserves the stored form name.
	 *
	 * @return void
	 */
	public function test_clear_confirmation_preserves_form_name() {
		CredentialsManager::save_form_name( $this->form_id, 'Grant application' );
		CredentialsManager::save_confirmation( $this->form_id, 'Thanks for submitting!' );

		$this->assertTrue( CredentialsManager::clear_confirmation( $this->form_id ) );
		$this->assertSame( 'Grant application', CredentialsManager::get_form_name( $this->form_id ) );
	}

	/**
	 * Delete returns false when the ID is empty or no row exists.
	 *
	 * @return void
	 */
	public function test_delete_returns_false_when_nothing_to_remove() {
		$this->assertFalse( CredentialsManager::delete( '' ) );
		$this->assertFalse( CredentialsManager::delete( '00000000-0000-4000-8000-000000000000' ) );
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

		CredentialsManager::activate( true );

		foreach ( $site_ids as $site_id ) {
			switch_to_blog( (int) $site_id );
			$this->assertTrue( $this->table_exists() );
			restore_current_blog();
		}
	}
}
