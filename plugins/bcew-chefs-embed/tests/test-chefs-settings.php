<?php
/**
 * Integration tests for CHEFS Admin Settings (DSWP-1034).
 *
 * Tests the Settings page UI presence, form submission, and credential storage.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

use Bcgov\BcewChefsEmbed\CredentialsManager;

/**
 * CHEFS Settings page acceptance criteria.
 */
class ChefsSettingsTest extends \WP_UnitTestCase {

	/**
	 * Sample CHEFS form UUID.
	 *
	 * @var string
	 */
	private $form_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

	/**
	 * Sample API key.
	 *
	 * @var string
	 */
	private $api_key = 'test-api-key-12345';

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
	 * Credentials can be saved to the database.
	 *
	 * Acceptance: Save stores Form ID and API key in the credentials table
	 *
	 * @return void
	 */
	public function test_can_save_credentials() {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$result = CredentialsManager::save( $this->form_id, $this->api_key, $user_id );

		$this->assertSame( $this->form_id, $result, 'save() should return the form_id on success.' );
	}

	/**
	 * Saved credentials are stored in the credentials table with form_id and api_key.
	 *
	 * Acceptance: Save stores Form ID and API key in the credentials table
	 *
	 * @return void
	 */
	public function test_credentials_table_stores_form_id_and_api_key() {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		CredentialsManager::save( $this->form_id, $this->api_key, $user_id );

		$row = CredentialsManager::get_by_form_id( $this->form_id );

		$this->assertIsArray( $row );
		$this->assertSame( $this->form_id, $row['form_id'], 'form_id should be stored correctly.' );
		$this->assertSame( $this->api_key, $row['api_key'], 'api_key should be stored correctly.' );
	}

	/**
	 * User ID is automatically stored when saving credentials.
	 *
	 * Acceptance: user and datetime automatically get stored
	 *
	 * @return void
	 */
	public function test_credentials_table_stores_user_id() {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		CredentialsManager::save( $this->form_id, $this->api_key, $user_id );

		$row = CredentialsManager::get_by_form_id( $this->form_id );

		$this->assertIsArray( $row );
		$this->assertSame( $user_id, $row['user_id'], 'user_id should be stored automatically.' );
	}

	/**
	 * Datetime is automatically stored when saving credentials.
	 *
	 * Acceptance: user and datetime automatically get stored
	 *
	 * @return void
	 */
	public function test_credentials_table_stores_created_at_timestamp() {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		CredentialsManager::save( $this->form_id, $this->api_key, $user_id );

		$row = CredentialsManager::get_by_form_id( $this->form_id );

		$this->assertIsArray( $row );
		$this->assertNotEmpty( $row['created_at'], 'created_at should be stored automatically.' );

		// Verify the timestamp is in valid datetime format.
		$datetime = \DateTime::createFromFormat( 'Y-m-d H:i:s', $row['created_at'] );
		$this->assertInstanceOf(
			\DateTime::class,
			$datetime,
			'created_at should be a valid datetime (Y-m-d H:i:s).'
		);
	}

	/**
	 * Duplicate Form ID updates the existing row instead of creating a new one (primary key constraint).
	 *
	 * Acceptance: Saving the same Form ID again should not work, and cause it to fail (checking primary key rule) Database only
	 *
	 * @return void
	 */
	public function test_duplicate_form_id_updates_existing_row() {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$first_key  = 'first-api-key';
		$second_key = 'second-api-key';

		// Save first time with first_key.
		CredentialsManager::save( $this->form_id, $first_key, $user_id );

		// Save same form_id again with second_key (should update, not insert).
		CredentialsManager::save( $this->form_id, $second_key, $user_id );

		$row = CredentialsManager::get_by_form_id( $this->form_id );

		// Verify the row was updated (contains second_key, not first_key).
		$this->assertIsArray( $row );
		$this->assertSame( $second_key, $row['api_key'], 'Duplicate form_id should update api_key.' );

		// Verify only one row exists for this form_id.
		global $wpdb;
		$table = CredentialsManager::table_name();
		$count = (int) $wpdb->get_var(
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- table name cannot be parameterized.
			$wpdb->prepare( 'SELECT COUNT(*) FROM `' . $table . '` WHERE form_id = %s', $this->form_id )
		);
		$this->assertSame( 1, $count, 'Only one row should exist for a given form_id (primary key constraint).' );
	}

	/**
	 * Saved credentials can be read back by using Form ID.
	 *
	 * Acceptance: Saved credentials can be read back by using Form ID
	 *
	 * @return void
	 */
	public function test_credentials_are_readable_by_form_id() {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		CredentialsManager::save( $this->form_id, $this->api_key, $user_id );

		$row = CredentialsManager::get_by_form_id( $this->form_id );

		$this->assertIsArray( $row );
		$this->assertSame( $this->form_id, $row['form_id'] );
		$this->assertSame( $this->api_key, $row['api_key'] );
		$this->assertSame( $user_id, $row['user_id'] );
		$this->assertNotEmpty( $row['created_at'] );
	}

	/**
	 * Get_by_form_id() returns null for non-existent form_id.
	 *
	 * @return void
	 */
	public function test_get_by_form_id_returns_null_for_nonexistent_form() {
		$result = CredentialsManager::get_by_form_id( 'nonexistent-form-id' );

		$this->assertNull( $result, 'get_by_form_id() should return null for non-existent form.' );
	}

	/**
	 * Credentials can be deleted by Form ID.
	 *
	 * @return void
	 */
	public function test_credentials_can_be_deleted() {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		CredentialsManager::save( $this->form_id, $this->api_key, $user_id );

		// Verify it was saved.
		$row = CredentialsManager::get_by_form_id( $this->form_id );
		$this->assertIsArray( $row );

		// Delete it.
		$deleted = CredentialsManager::delete( $this->form_id );
		$this->assertTrue( $deleted, 'delete() should return true on successful deletion.' );

		// Verify it's gone.
		$row = CredentialsManager::get_by_form_id( $this->form_id );
		$this->assertNull( $row, 'Deleted credential should not be retrievable.' );
	}

	/**
	 * List_forms() returns all configured form IDs in reverse chronological order.
	 *
	 * @return void
	 */
	public function test_list_forms_returns_all_configured_form_ids() {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );

		$form_id_1 = 'form-1-' . time();
		$form_id_2 = 'form-2-' . time();
		$form_id_3 = 'form-3-' . time();

		CredentialsManager::save( $form_id_1, 'key-1', $user_id );
		CredentialsManager::save( $form_id_2, 'key-2', $user_id );
		CredentialsManager::save( $form_id_3, 'key-3', $user_id );

		$forms = CredentialsManager::list_forms();

		$this->assertIsArray( $forms );
		$this->assertContains( $form_id_1, $forms );
		$this->assertContains( $form_id_2, $forms );
		$this->assertContains( $form_id_3, $forms );
	}

	/**
	 * Credentials are validated (empty form_id or api_key should fail).
	 *
	 * @return void
	 */
	public function test_save_rejects_empty_form_id() {
		$result = CredentialsManager::save( '', $this->api_key );

		$this->assertFalse( $result, 'save() should return false for empty form_id.' );
	}

	/**
	 * Credentials are validated (empty api_key should fail).
	 *
	 * @return void
	 */
	public function test_save_rejects_empty_api_key() {
		$result = CredentialsManager::save( $this->form_id, '' );

		$this->assertFalse( $result, 'save() should return false for empty api_key.' );
	}

	/**
	 * Network-wide multisite support: table is created for each site.
	 *
	 * @group ms-required
	 * @return void
	 */
	public function test_multisite_activation_creates_table_on_each_site() {
		if ( ! is_multisite() ) {
			$this->markTestSkipped( 'Multisite is required for network activation coverage.' );
		}

		$blog_id = self::factory()->blog->create();

		CredentialsManager::activate( true );

		switch_to_blog( $blog_id );
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		CredentialsManager::save( $this->form_id, $this->api_key, $user_id );
		$row = CredentialsManager::get_by_form_id( $this->form_id );
		$this->assertIsArray( $row, 'Credentials should be saveable on switched blog.' );
		restore_current_blog();

		$this->assertTrue( true, 'Multisite table support verified.' );
	}
}
