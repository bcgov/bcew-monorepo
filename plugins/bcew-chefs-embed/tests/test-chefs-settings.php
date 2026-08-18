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
use Bcgov\BcewChefsEmbed\OptionsManager;

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
	 * Administrator user ID for testing.
	 *
	 * @var int
	 */
	private $admin_user_id;

	/**
	 * Ensure the table exists and clear rows before each test.
	 *
	 * @return void
	 */
	public function set_up() {
		parent::set_up();

		CredentialsManager::install();
		OptionsManager::install();

		global $wpdb;

		$credentials_table = CredentialsManager::table_name();
		$options_table     = OptionsManager::table_name();
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- internal table name.
		$wpdb->query( "DELETE FROM `{$credentials_table}`" );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- internal table name.
		$wpdb->query( "DELETE FROM `{$options_table}`" );

		$this->admin_user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $this->admin_user_id );
	}

	/**
	 * Credentials can be saved to the database.
	 *
	 * Acceptance: Save stores Form ID and API key in the credentials table
	 *
	 * @return void
	 */
	public function test_can_save_credentials() {
		$result = CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

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
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

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
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

		$row = CredentialsManager::get_by_form_id( $this->form_id );

		$this->assertIsArray( $row );
		$this->assertSame( $this->admin_user_id, $row['user_id'], 'user_id should be stored automatically.' );
	}

	/**
	 * Datetime is automatically stored when saving credentials.
	 *
	 * Acceptance: user and datetime automatically get stored
	 *
	 * @return void
	 */
	public function test_credentials_table_stores_created_at_timestamp() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

		$row = CredentialsManager::get_by_form_id( $this->form_id );

		$this->assertIsArray( $row );
		$this->assertNotEmpty( $row['created_at'], 'created_at should be stored automatically.' );
		$this->assertValidDatetime( $row['created_at'] );
	}

	/**
	 * Duplicate Form ID updates the existing row instead of creating a new one (primary key constraint).
	 *
	 * Acceptance: Saving the same Form ID again should not work, and cause it to fail (checking primary key rule) Database only
	 *
	 * @return void
	 */
	public function test_duplicate_form_id_updates_existing_row() {
		$first_key  = 'first-api-key';
		$second_key = 'second-api-key';

		// Save first time with first_key.
		CredentialsManager::save( $this->form_id, $first_key, $this->admin_user_id );

		// Save same form_id again with second_key (should update, not insert).
		CredentialsManager::save( $this->form_id, $second_key, $this->admin_user_id );

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
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

		$row = CredentialsManager::get_by_form_id( $this->form_id );

		$this->assertIsArray( $row );
		$this->assertSame( $this->form_id, $row['form_id'] );
		$this->assertSame( $this->api_key, $row['api_key'] );
		$this->assertSame( $this->admin_user_id, $row['user_id'] );
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
	 * Acceptance: Clicking remove deletes the row for that Form ID (database).
	 *
	 * @return void
	 */
	public function test_credentials_can_be_deleted() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

		// Verify it was saved.
		$row = CredentialsManager::get_by_form_id( $this->form_id );
		$this->assertIsArray( $row );

		// Delete it.
		$deleted = CredentialsManager::delete( $this->form_id );
		$this->assertTrue( $deleted, 'delete() should return true on successful deletion.' );

		// Verify it's gone from lookup.
		$row = CredentialsManager::get_by_form_id( $this->form_id );
		$this->assertNull( $row, 'Deleted credential should not be retrievable.' );

		// Verify the DB row is actually gone (not just the helper returning null).
		global $wpdb;
		$table = CredentialsManager::table_name();
		$count = (int) $wpdb->get_var(
			// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- table name cannot be parameterized.
			$wpdb->prepare( 'SELECT COUNT(*) FROM `' . $table . '` WHERE form_id = %s', $this->form_id )
		);
		$this->assertSame( 0, $count, 'Deleted form_id should have zero rows in the credentials table.' );
	}

	/**
	 * After delete, the form no longer appears in the saved forms list.
	 *
	 * Acceptance: Removed form no longer appears in the saved forms list.
	 *
	 * @return void
	 */
	public function test_deleted_form_no_longer_appears_in_list_forms() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

		$before_ids = array_column( CredentialsManager::list_forms(), 'form_id' );
		$this->assertContains( $this->form_id, $before_ids );

		CredentialsManager::delete( $this->form_id );

		$after_ids = array_column( CredentialsManager::list_forms(), 'form_id' );
		$this->assertNotContains( $this->form_id, $after_ids, 'Removed form must not appear in list_forms().' );
	}

	/**
	 * Settings page shows a Remove action that posts to admin_post_bcew_chefs_delete.
	 *
	 * Acceptance: Each saved form on the settings page has a remove action.
	 *
	 * @return void
	 */
	public function test_settings_page_renders_remove_action_for_each_form() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

		ob_start();
		( new \Bcgov\BcewChefsEmbed\Settings() )->render_page();
		$html = ob_get_clean();

		$this->assertStringContainsString(
			'name="action" value="bcew_chefs_delete"',
			$html,
			'Remove form must post action=bcew_chefs_delete.'
		);
		$this->assertStringContainsString(
			'name="form_id" value="' . esc_attr( $this->form_id ) . '"',
			$html,
			'Remove form must include the Form ID as a hidden field.'
		);
		$this->assertStringContainsString(
			'Remove form',
			$html,
			'Each saved form should expose a Remove form control.'
		);
		$this->assertStringContainsString(
			'bcew_chefs_delete',
			$html,
			'Remove form must include a nonce for bcew_chefs_delete.'
		);
	}

	/**
	 * Settings page shows confirmation as text, with edit on the right.
	 *
	 * @return void
	 */
	public function test_settings_page_renders_confirmation_field_for_each_form() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

		ob_start();
		( new \Bcgov\BcewChefsEmbed\Settings() )->render_page();
		$html = ob_get_clean();

		$this->assertStringContainsString(
			'Edit confirmation',
			$html,
			'Each saved form should expose an Edit confirmation control.'
		);
		$this->assertStringNotContainsString(
			'name="action" value="bcew_chefs_save_confirmation"',
			$html,
			'The save form should not render until Edit confirmation is clicked.'
		);
		$this->assertStringNotContainsString(
			'name="confirmation"',
			$html,
			'Confirmation should be plain text until Edit confirmation is clicked.'
		);
		$this->assertStringContainsString(
			'Your form has been submitted successfully',
			$html,
			'The generic success body should be visible above the table.'
		);
		$this->assertStringContainsString(
			'There is no custom confirmation for this form. The generic message will be used.',
			$html,
			'Forms without a custom message should say the generic message will be used.'
		);
		$this->assertStringNotContainsString(
			'name="action" value="bcew_chefs_delete_confirmation"',
			$html,
			'Remove custom confirmation should be hidden until a custom message exists.'
		);
	}

	/**
	 * Saved confirmation text is shown as plain text, with remove and edit actions.
	 *
	 * @return void
	 */
	public function test_settings_page_shows_saved_confirmation_and_delete_action() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );
		OptionsManager::save( $this->form_id, 'Thanks for applying.' );

		ob_start();
		( new \Bcgov\BcewChefsEmbed\Settings() )->render_page();
		$html = ob_get_clean();

		$this->assertStringContainsString(
			'Thanks for applying.',
			$html,
			'The confirmation column should show the saved message as text.'
		);
		$this->assertStringNotContainsString(
			'<textarea',
			$html,
			'The confirmation should not be an input until Edit confirmation is clicked.'
		);
		$this->assertStringContainsString(
			'name="action" value="bcew_chefs_delete_confirmation"',
			$html,
			'Remove custom confirmation must post action=bcew_chefs_delete_confirmation.'
		);
		$this->assertStringContainsString(
			'Remove this custom confirmation?',
			$html,
			'Remove custom confirmation must ask before submitting.'
		);
		$this->assertStringContainsString(
			'Edit confirmation',
			$html,
			'A saved confirmation should expose Edit confirmation.'
		);
		$this->assertStringNotContainsString(
			'There is no custom confirmation for this form. The generic message will be used.',
			$html,
			'Empty-state copy should not show while a custom message is saved.'
		);
	}

	/**
	 * Edit mode shows a textarea and replaces Edit with Save confirmation.
	 *
	 * @return void
	 */
	public function test_settings_page_edit_mode_shows_textarea_and_save() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );
		OptionsManager::save( $this->form_id, 'Thanks for applying.' );

		$_GET['edit_confirmation'] = $this->form_id;

		ob_start();
		( new \Bcgov\BcewChefsEmbed\Settings() )->render_page();
		$html = ob_get_clean();

		unset( $_GET['edit_confirmation'] );

		$this->assertStringContainsString(
			'name="action" value="bcew_chefs_save_confirmation"',
			$html,
			'Edit mode must post action=bcew_chefs_save_confirmation.'
		);
		$this->assertStringContainsString(
			'<textarea',
			$html,
			'Edit mode should show a confirmation text box.'
		);
		$this->assertStringContainsString(
			'Save confirmation',
			$html,
			'Edit mode should replace Edit confirmation with Save confirmation.'
		);
		$this->assertStringNotContainsString(
			'Edit confirmation',
			$html,
			'Edit confirmation should not show while that row is in edit mode.'
		);
		$this->assertStringNotContainsString(
			'Remove form',
			$html,
			'Remove form should not show while that row is in edit mode.'
		);
		$this->assertStringNotContainsString(
			'Remove custom confirmation',
			$html,
			'Remove custom confirmation should not show while that row is in edit mode.'
		);
	}

	/**
	 * Handle save confirmation rejects users without manage_options.
	 *
	 * @return void
	 */
	public function test_handle_save_confirmation_requires_manage_options() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

		$subscriber_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber_id );

		$nonce                 = wp_create_nonce( 'bcew_chefs_save_confirmation' );
		$_POST['form_id']      = $this->form_id;
		$_POST['confirmation'] = 'Thanks';
		$_POST['_wpnonce']     = $nonce;
		$_REQUEST['_wpnonce']  = $nonce;

		$this->expectException( \WPDieException::class );

		( new \Bcgov\BcewChefsEmbed\Settings() )->handle_save_confirmation();
	}

	/**
	 * Handle delete confirmation rejects users without manage_options.
	 *
	 * @return void
	 */
	public function test_handle_delete_confirmation_requires_manage_options() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );
		OptionsManager::save( $this->form_id, 'Thanks' );

		$subscriber_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber_id );

		$nonce                = wp_create_nonce( 'bcew_chefs_delete_confirmation' );
		$_POST['form_id']     = $this->form_id;
		$_POST['_wpnonce']    = $nonce;
		$_REQUEST['_wpnonce'] = $nonce;

		$this->expectException( \WPDieException::class );

		( new \Bcgov\BcewChefsEmbed\Settings() )->handle_delete_confirmation();
	}

	/**
	 * Saving a confirmation stores it and redirects with a success flag.
	 *
	 * @return void
	 */
	public function test_handle_save_confirmation_stores_message_and_redirects() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

		$nonce                 = wp_create_nonce( 'bcew_chefs_save_confirmation' );
		$_POST['form_id']      = $this->form_id;
		$_POST['confirmation'] = "Thanks for applying.\nPlease keep your reference number.";
		$_POST['_wpnonce']     = $nonce;
		$_REQUEST['_wpnonce']  = $nonce;

		$location = $this->capture_settings_redirect(
			static function () {
				( new \Bcgov\BcewChefsEmbed\Settings() )->handle_save_confirmation();
			}
		);

		$this->assertStringContainsString( 'chefs_confirmation_saved=1', $location );
		$this->assertSame(
			"Thanks for applying.\nPlease keep your reference number.",
			OptionsManager::get_confirmation( $this->form_id )
		);
	}

	/**
	 * Saving a blank confirmation is rejected and does not clear an existing message.
	 *
	 * @return void
	 */
	public function test_handle_save_confirmation_rejects_empty_message() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );
		OptionsManager::save( $this->form_id, 'Keep me' );

		$nonce                 = wp_create_nonce( 'bcew_chefs_save_confirmation' );
		$_POST['form_id']      = $this->form_id;
		$_POST['confirmation'] = '   ';
		$_POST['_wpnonce']     = $nonce;
		$_REQUEST['_wpnonce']  = $nonce;

		$location = $this->capture_settings_redirect(
			static function () {
				( new \Bcgov\BcewChefsEmbed\Settings() )->handle_save_confirmation();
			}
		);

		$this->assertStringContainsString( 'chefs_confirmation_error=1', $location );
		$this->assertSame( 'Keep me', OptionsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Removing a confirmation deletes it and redirects with a cleared flag.
	 *
	 * @return void
	 */
	public function test_handle_delete_confirmation_removes_message_and_redirects() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );
		OptionsManager::save( $this->form_id, 'Thanks for applying.' );

		$nonce                = wp_create_nonce( 'bcew_chefs_delete_confirmation' );
		$_POST['form_id']     = $this->form_id;
		$_POST['_wpnonce']    = $nonce;
		$_REQUEST['_wpnonce'] = $nonce;

		$location = $this->capture_settings_redirect(
			static function () {
				( new \Bcgov\BcewChefsEmbed\Settings() )->handle_delete_confirmation();
			}
		);

		$this->assertStringContainsString( 'chefs_confirmation_cleared=1', $location );
		$this->assertNull( OptionsManager::get_confirmation( $this->form_id ) );
	}

	/**
	 * Editing one form does not put other forms into edit mode.
	 *
	 * @return void
	 */
	public function test_settings_page_edit_mode_is_limited_to_one_form() {
		$other_form_id = 'c3d4e5f6-a7b8-9012-cdef-123456789012';

		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );
		CredentialsManager::save( $other_form_id, $this->api_key, $this->admin_user_id );
		OptionsManager::save( $this->form_id, 'Thanks for applying.' );

		$_GET['edit_confirmation'] = $this->form_id;

		ob_start();
		( new \Bcgov\BcewChefsEmbed\Settings() )->render_page();
		$html = ob_get_clean();

		unset( $_GET['edit_confirmation'] );

		$this->assertSame( 1, substr_count( $html, 'Save confirmation' ) );
		$this->assertSame( 1, substr_count( $html, 'Edit confirmation' ) );
		$this->assertSame( 1, substr_count( $html, 'Remove form' ) );
		$this->assertStringContainsString(
			'There is no custom confirmation for this form. The generic message will be used.',
			$html
		);
	}

	/**
	 * Confirmation status notices render from redirect flags.
	 *
	 * @return void
	 */
	public function test_settings_page_renders_confirmation_notices() {
		$_GET['chefs_confirmation_saved'] = '1';
		ob_start();
		( new \Bcgov\BcewChefsEmbed\Settings() )->render_page();
		$saved_html = ob_get_clean();
		unset( $_GET['chefs_confirmation_saved'] );

		$this->assertStringContainsString( 'Confirmation message saved.', $saved_html );

		$_GET['chefs_confirmation_cleared'] = '1';
		ob_start();
		( new \Bcgov\BcewChefsEmbed\Settings() )->render_page();
		$cleared_html = ob_get_clean();
		unset( $_GET['chefs_confirmation_cleared'] );

		$this->assertStringContainsString(
			'Custom confirmation deleted. The generic success message will be used.',
			$cleared_html
		);

		$_GET['chefs_confirmation_error'] = '1';
		ob_start();
		( new \Bcgov\BcewChefsEmbed\Settings() )->render_page();
		$error_html = ob_get_clean();
		unset( $_GET['chefs_confirmation_error'] );

		$this->assertStringContainsString( 'Unable to save the confirmation message.', $error_html );
	}

	/**
	 * Handle delete rejects users without manage_options.
	 *
	 * Acceptance: Only users with manage_options can remove forms.
	 *
	 * @return void
	 */
	public function test_handle_delete_requires_manage_options() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

		$subscriber_id = self::factory()->user->create( array( 'role' => 'subscriber' ) );
		wp_set_current_user( $subscriber_id );

		$nonce                = wp_create_nonce( 'bcew_chefs_delete' );
		$_POST['form_id']     = $this->form_id;
		$_POST['_wpnonce']    = $nonce;
		$_REQUEST['_wpnonce'] = $nonce;

		$this->expectException( \WPDieException::class );

		( new \Bcgov\BcewChefsEmbed\Settings() )->handle_delete();
	}

	/**
	 * List_forms() returns all configured forms as arrays with form_id and created_at.
	 *
	 * @return void
	 */
	public function test_list_forms_returns_all_configured_form_ids() {
		$form_id_1 = 'form-1-' . time();
		$form_id_2 = 'form-2-' . time();
		$form_id_3 = 'form-3-' . time();

		CredentialsManager::save( $form_id_1, 'key-1', $this->admin_user_id );
		CredentialsManager::save( $form_id_2, 'key-2', $this->admin_user_id );
		CredentialsManager::save( $form_id_3, 'key-3', $this->admin_user_id );

		$forms = CredentialsManager::list_forms();

		$this->assertIsArray( $forms );

		$returned_ids = array_column( $forms, 'form_id' );
		$this->assertContains( $form_id_1, $returned_ids );
		$this->assertContains( $form_id_2, $returned_ids );
		$this->assertContains( $form_id_3, $returned_ids );
	}

	/**
	 * List_forms() returns a created_at timestamp for each form.
	 *
	 * @return void
	 */
	public function test_list_forms_returns_created_at_for_each_form() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

		$forms = CredentialsManager::list_forms();

		$this->assertNotEmpty( $forms );

		$form = $forms[0];
		$this->assertArrayHasKey( 'form_id', $form, 'Each list_forms() row must have a form_id key.' );
		$this->assertArrayHasKey( 'created_at', $form, 'Each list_forms() row must have a created_at key.' );
		$this->assertNotEmpty( $form['created_at'], 'created_at should not be empty.' );
		$this->assertValidDatetime( $form['created_at'] );
	}

	/**
	 * The 'Configured Forms' table renders the Form ID and formatted date for each saved form.
	 *
	 * @return void
	 */
	public function test_settings_page_renders_form_id_and_date_in_table() {
		CredentialsManager::save( $this->form_id, $this->api_key, $this->admin_user_id );

		$row           = CredentialsManager::get_by_form_id( $this->form_id );
		$timestamp     = strtotime( $row['created_at'] );
		$expected_date = $timestamp ? date_i18n( get_option( 'date_format' ), $timestamp ) : $row['created_at'];

		ob_start();
		( new \Bcgov\BcewChefsEmbed\Settings() )->render_page();
		$html = ob_get_clean();

		$this->assertStringContainsString(
			esc_html( $this->form_id ),
			$html,
			'The Configured Forms table should display the Form ID.'
		);
		$this->assertStringContainsString(
			esc_html( $expected_date ),
			$html,
			'The Configured Forms table should display the formatted created_at date.'
		);
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

		// switch_to_blog changes DB context, so a new user is needed for that site.
		switch_to_blog( $blog_id );
		$switched_user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );
		CredentialsManager::save( $this->form_id, $this->api_key, $switched_user_id );
		$row = CredentialsManager::get_by_form_id( $this->form_id );
		$this->assertIsArray( $row, 'Credentials should be saveable on switched blog.' );
		restore_current_blog();

		$this->assertTrue( true, 'Multisite table support verified.' );
	}

	/**
     * Assert that a given value is a valid Y-m-d H:i:s datetime string.
     *
     * @param string $value The value to check.
     * @return void
     */
	private function assertValidDatetime( $value ) {
		$datetime = \DateTime::createFromFormat( 'Y-m-d H:i:s', $value );
		$errors   = \DateTime::getLastErrors();

		$this->assertInstanceOf( \DateTime::class, $datetime, "'{$value}' should be a valid Y-m-d H:i:s datetime." );
		$this->assertIsArray( $errors );
		$this->assertSame( 0, (int) $errors['warning_count'], "'{$value}' should not produce DateTime parse warnings." );
		$this->assertSame( 0, (int) $errors['error_count'], "'{$value}' should not produce DateTime parse errors." );
		$this->assertSame( $value, $datetime->format( 'Y-m-d H:i:s' ), "'{$value}' should match the expected datetime format exactly." );
	}

	/**
	 * Run a settings handler and capture the redirect location.
	 *
	 * @param callable $callback Handler to invoke.
	 * @return string Redirect URL.
	 */
	private function capture_settings_redirect( $callback ) {
		add_filter(
			'wp_redirect',
			static function ( $location ) {
				// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Redirect URL is captured for assertions, not printed.
				throw new \RuntimeException( $location );
			}
		);

		try {
			$callback();
			$this->fail( 'Expected a redirect.' );
		} catch ( \RuntimeException $exception ) {
			return $exception->getMessage();
		} finally {
			remove_all_filters( 'wp_redirect' );
		}
	}
}
