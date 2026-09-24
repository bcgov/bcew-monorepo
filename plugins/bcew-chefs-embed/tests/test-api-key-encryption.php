<?php
/**
 * Integration tests for CHEFS API key encryption at rest (DSWP-1037).
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

use Bcgov\BcewChefsEmbed\CredentialsManager;
use Bcgov\BcewChefsEmbed\Crypto;

/**
 * API key encryption acceptance criteria.
 */
class ApiKeyEncryptionTest extends \WP_UnitTestCase {

	/**
	 * Sample CHEFS form UUID.
	 *
	 * @var string
	 */
	private $form_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

	/**
	 * Sample API key plaintext.
	 *
	 * @var string
	 */
	private $api_key = 'test-api-key-value';

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
	 * Read the raw api_key column value from the database.
	 *
	 * @param string $form_id Form ID.
	 * @return string|null
	 */
	private function get_raw_api_key( $form_id ) {
		global $wpdb;

		$table = CredentialsManager::table_name();

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared -- table name cannot be parameterized.
		$value = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT api_key FROM `{$table}` WHERE form_id = %s",
				$form_id
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.PreparedSQL.NotPrepared

		return is_string( $value ) ? $value : null;
	}

	/**
	 * API key is not stored in plaintext in the database.
	 *
	 * @return void
	 */
	public function test_api_key_is_not_stored_in_plaintext() {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );

		$saved = CredentialsManager::save( $this->form_id, $this->api_key, $user_id );
		$this->assertSame( $this->form_id, $saved );

		$raw = $this->get_raw_api_key( $this->form_id );
		$this->assertNotNull( $raw );
		$this->assertNotSame( $this->api_key, $raw );
		$this->assertStringNotContainsString( $this->api_key, $raw );
	}

	/**
	 * Encryption uses sodium (libsodium) with WordPress auth salt when available.
	 *
	 * @return void
	 */
	public function test_api_key_is_encrypted_with_sodium_when_available() {
		if ( ! function_exists( 'sodium_crypto_secretbox' ) ) {
			$this->markTestSkipped( 'libsodium is required for this acceptance criterion.' );
		}

		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );

		CredentialsManager::save( $this->form_id, $this->api_key, $user_id );

		$raw = $this->get_raw_api_key( $this->form_id );
		$this->assertNotNull( $raw );
		$this->assertStringStartsWith( Crypto::PREFIX_SODIUM, $raw );
	}

	/**
	 * API key can be decrypted server-side when needed.
	 *
	 * @return void
	 */
	public function test_api_key_can_be_decrypted_server_side() {
		$user_id = self::factory()->user->create( array( 'role' => 'administrator' ) );

		CredentialsManager::save( $this->form_id, $this->api_key, $user_id );

		$row = CredentialsManager::get_by_form_id( $this->form_id );
		$this->assertIsArray( $row );
		$this->assertSame( $this->api_key, $row['api_key'] );

		$raw = $this->get_raw_api_key( $this->form_id );
		$this->assertNotNull( $raw );
		$this->assertSame( $this->api_key, Crypto::decrypt( $raw ) );
	}
}
