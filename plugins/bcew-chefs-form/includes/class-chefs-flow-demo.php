<?php
/**
 * Dev-only bridge: record what WordPress does so the flow demo can step through it.
 *
 * Enable with: define( 'BCEW_CHEFS_FLOW_DEMO', true );
 *
 * @package bcew-chefs-form
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Local demo bridge between WordPress and tools/chefs-flow-demo.
 */
class BCEW_Chefs_Flow_Demo {

	const TRANSIENT_KEY = 'bcew_chefs_flow_demo_latest';

	/**
	 * @return bool
	 */
	public static function is_enabled() {
		if ( defined( 'BCEW_CHEFS_FLOW_DEMO' ) ) {
			return (bool) BCEW_CHEFS_FLOW_DEMO;
		}

		// Local wp-env often has WP_DEBUG on even when the custom constant was not injected yet.
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			return true;
		}

		return function_exists( 'wp_get_environment_type' )
			&& in_array( wp_get_environment_type(), array( 'local', 'development' ), true );
	}

	/**
	 * @return void
	 */
	public static function init() {
		if ( ! self::is_enabled() ) {
			return;
		}

		add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
		add_filter( 'rest_pre_serve_request', array( __CLASS__, 'send_cors_headers' ), 15, 4 );
	}

	/**
	 * @return void
	 */
	public static function register_routes() {
		register_rest_route(
			'bcew-chefs/v1',
			'/flow-demo-state',
			array(
				array(
					'methods'             => 'GET',
					'permission_callback' => '__return_true',
					'callback'            => array( __CLASS__, 'get_state' ),
				),
				array(
					'methods'             => 'OPTIONS',
					'permission_callback' => '__return_true',
					'callback'            => static function () {
						return new WP_REST_Response( null, 204 );
					},
				),
			)
		);
	}

	/**
	 * @param bool             $served  Served.
	 * @param WP_HTTP_Response $result  Result.
	 * @param WP_REST_Request  $request Request.
	 * @param WP_REST_Server   $server  Server.
	 * @return bool
	 */
	public static function send_cors_headers( $served, $result, $request, $server ) {
		if ( '/bcew-chefs/v1/flow-demo-state' !== $request->get_route() ) {
			return $served;
		}

		$origin = isset( $_SERVER['HTTP_ORIGIN'] ) ? esc_url_raw( wp_unslash( $_SERVER['HTTP_ORIGIN'] ) ) : '';

		if ( self::is_allowed_origin( $origin ) ) {
			header( 'Access-Control-Allow-Origin: ' . $origin );
			header( 'Access-Control-Allow-Methods: GET, OPTIONS' );
			header( 'Access-Control-Allow-Headers: Content-Type' );
			header( 'Vary: Origin' );
		}

		return $served;
	}

	/**
	 * @param string $origin Origin.
	 * @return bool
	 */
	private static function is_allowed_origin( $origin ) {
		if ( '' === $origin ) {
			return false;
		}

		$host = wp_parse_url( $origin, PHP_URL_HOST );

		return in_array( $host, array( 'localhost', '127.0.0.1' ), true );
	}

	/**
	 * Record a guided walkthrough after admin save.
	 *
	 * @param string $label   Form label.
	 * @param string $embed_ref Embed reference.
	 * @return void
	 */
	public static function record_save( $label, $embed_ref ) {
		if ( ! self::is_enabled() ) {
			return;
		}

		$row = self::get_row_by_embed_ref( $embed_ref );

		self::store_event(
			array(
				'id'        => uniqid( 'save_', true ),
				'type'      => 'save',
				'title'     => 'Form saved in WordPress admin',
				'label'     => $label,
				'embed_ref' => $embed_ref,
				'at'        => gmdate( 'c' ),
				'steps'     => array(
					array(
						'title'   => '1. Admin submitted the form',
						'summary' => 'Someone entered a label, Form ID, and API key on the CHEFS Forms settings page and clicked Save.',
						'file'    => 'plugins/bcew-chefs-form/includes/class-chefs-settings.php',
						'func'    => 'BCEW_Chefs_Settings::handle_save()',
						'code'    => "public static function handle_save() {\n    check_admin_referer( 'bcew_chefs_save' );\n    \$form_id = sanitize_text_field( wp_unslash( \$_POST['form_id'] ?? '' ) );\n    \$api_key = sanitize_text_field( wp_unslash( \$_POST['api_key'] ?? '' ) );\n    \$label   = sanitize_text_field( wp_unslash( \$_POST['label'] ?? '' ) );\n    // …\n}",
						'watch'   => 'Plaintext secrets exist only in this request — not stored yet.',
					),
					array(
						'title'   => '2. WordPress checked the credentials with CHEFS',
						'summary' => 'Before saving anything, WordPress called the CHEFS gateway. If CHEFS rejects the key, nothing is written to the database.',
						'file'    => 'plugins/bcew-chefs-form/bcew-chefs-form.php',
						'func'    => 'bcew_chefs_form_get_gateway_token()',
						'code'    => "\$response = wp_remote_post(\n    BCEW_CHEFS_BASE_URL . '/gateway/v1/auth/token/forms/' . \$form_id,\n    [\n        'headers' => [\n            'Authorization' => 'Basic ' . base64_encode( \$form_id . ':' . \$api_key ),\n        ],\n    ]\n);",
						'watch'   => 'Still no database write. This is a live check against CHEFS.',
					),
					array(
						'title'   => '3. Secrets were encrypted',
						'summary' => 'Form ID and API key were sealed with PHP sodium/OpenSSL using a key derived from WordPress AUTH salts.',
						'file'    => 'plugins/bcew-chefs-form/includes/class-chefs-crypto.php',
						'func'    => 'BCEW_Chefs_Crypto::encrypt()',
						'code'    => "public static function encrypt( \$plaintext ) {\n    \$key = self::get_key(); // hash( wp_salt('auth') . '|bcew-chefs-form' )\n    \$nonce = random_bytes( SODIUM_CRYPTO_SECRETBOX_NONCEBYTES );\n    \$box   = sodium_crypto_secretbox( \$plaintext, \$nonce, \$key );\n    return 's1:' . base64_encode( \$nonce . \$box );\n}",
						'watch'   => $row
							? 'Encrypted Form ID now looks like: ' . self::preview( $row['form_id_encrypted'] )
							: 'Encrypted blobs were produced in memory.',
					),
					array(
						'title'   => '4. Sealed values were written to the custom table',
						'summary' => 'Row stored in ' . BCEW_Chefs_Credentials::table_name() . '. Label stays readable. Form ID and API key stay encrypted. An opaque embed_ref is what the block will use later.',
						'file'    => 'plugins/bcew-chefs-form/includes/class-chefs-credentials.php',
						'func'    => 'BCEW_Chefs_Credentials::save()',
						'code'    => "\$wpdb->insert( self::table_name(), [\n    'embed_ref'         => \$embed_ref,\n    'label'             => \$label,\n    'form_id_hash'      => BCEW_Chefs_Crypto::hash_form_id( \$form_id ),\n    'form_id_encrypted' => BCEW_Chefs_Crypto::encrypt( \$form_id ),\n    'api_key_encrypted' => BCEW_Chefs_Crypto::encrypt( \$api_key ),\n] );\n// table: " . BCEW_Chefs_Credentials::table_name(),
						'watch'   => $row
							? 'embed_ref = ' . $row['embed_ref'] . ' · label = ' . $row['label']
							: 'Row written to custom table (not wp_options).',
						'row'     => $row,
					),
				),
			)
		);
	}

	/**
	 * Record a guided walkthrough after frontend embed-config.
	 *
	 * @param string               $embed_ref Embed reference.
	 * @param array<string,mixed>  $config    Embed config returned to the browser.
	 * @return void
	 */
	public static function record_embed( $embed_ref, $config ) {
		if ( ! self::is_enabled() ) {
			return;
		}

		$row     = self::get_row_by_embed_ref( $embed_ref );
		$success = ! empty( $config['success'] );

		self::store_event(
			array(
				'id'        => uniqid( 'embed_', true ),
				'type'      => 'embed',
				'title'     => 'Frontend asked WordPress for the form',
				'embed_ref' => $embed_ref,
				'at'        => gmdate( 'c' ),
				'steps'     => array(
					array(
						'title'   => '1. The page only had an embed_ref',
						'summary' => 'The block on the page does not contain the API key. The browser only knows a random reference: ' . $embed_ref,
						'file'    => 'plugins/bcew-chefs-form/src/chefs-form/render.php',
						'func'    => 'block render → data-bcew-chefs-embed',
						'code'    => 'data-bcew-chefs-embed="<?php echo esc_attr( $embed_ref ); ?>"' . "\n"
							. '// file also: plugins/bcew-chefs-form/src/chefs-form/view.js' . "\n"
							. '// GET /wp-json/bcew-chefs/v1/embed-config?embed_ref=…',
						'watch'   => 'Visitor never received the long-term API key.',
					),
					array(
						'title'   => '2. WordPress loaded the sealed row',
						'summary' => 'Server looked up the custom table by embed_ref and read the encrypted columns.',
						'file'    => 'plugins/bcew-chefs-form/includes/class-chefs-credentials.php',
						'func'    => 'BCEW_Chefs_Credentials::get_by_embed_ref()',
						'code'    => "\$row = \$wpdb->get_row( \$wpdb->prepare(\n    'SELECT label, form_id_encrypted, api_key_encrypted\n     FROM ' . self::table_name() . ' WHERE embed_ref = %s',\n    \$embed_ref\n), ARRAY_A );",
						'watch'   => $row
							? 'Found encrypted api_key: ' . self::preview( $row['api_key_encrypted'] )
							: 'Lookup by embed_ref.',
						'row'     => $row,
					),
					array(
						'title'   => '3. Server decrypted in memory',
						'summary' => 'PHP rebuilt the key from WordPress salts and unlocked Form ID + API key only for this request.',
						'file'    => 'plugins/bcew-chefs-form/includes/class-chefs-crypto.php',
						'func'    => 'BCEW_Chefs_Crypto::decrypt()',
						'code'    => "\$form_id = BCEW_Chefs_Crypto::decrypt( \$row['form_id_encrypted'] );\n\$api_key = BCEW_Chefs_Crypto::decrypt( \$row['api_key_encrypted'] );\n// key = hash( wp_salt('auth') . '|bcew-chefs-form' )",
						'watch'   => 'Decrypted values stay in PHP — they are not written back to the DB as plaintext.',
					),
					array(
						'title'   => '4. Short-lived token went to the browser',
						'summary' => $success
							? 'WordPress traded the API key for a CHEFS auth token, then returned formId + authToken to the page. The API key itself was not sent.'
							: 'Token request failed: ' . ( $config['error'] ?? 'unknown error' ),
						'file'    => 'plugins/bcew-chefs-form/bcew-chefs-form.php',
						'func'    => 'bcew_chefs_form_get_embed_config()',
						'code'    => "\$token = bcew_chefs_form_get_gateway_token( \$record['form_id'], \$record['api_key'] );\nreturn [\n    'success'   => true,\n    'formId'    => \$record['form_id'],\n    'authToken' => \$token['token'], // NOT api_key\n];",
						'watch'   => $success
							? 'Browser received a temporary authToken. API key never left the server.'
							: 'No token returned.',
					),
				),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function get_state() {
		$event = get_transient( self::TRANSIENT_KEY );
		$rows  = self::list_rows();

		return rest_ensure_response(
			array(
				'enabled'     => true,
				'table'       => BCEW_Chefs_Credentials::table_name(),
				'rowCount'    => count( $rows ),
				'rows'        => $rows,
				'latestEvent' => is_array( $event ) ? $event : null,
				'hint'        => 'Do something in WordPress (save a form, or load a page with the block). Then step through the captured event here.',
				'fetchedAt'   => gmdate( 'c' ),
			)
		);
	}

	/**
	 * @param array<string,mixed> $event Event payload.
	 * @return void
	 */
	private static function store_event( $event ) {
		set_transient( self::TRANSIENT_KEY, $event, DAY_IN_SECONDS );
	}

	/**
	 * @param string $value Ciphertext.
	 * @return string
	 */
	private static function preview( $value ) {
		$value = (string) $value;

		return strlen( $value ) > 36 ? substr( $value, 0, 36 ) . '…' : $value;
	}

	/**
	 * @param string $embed_ref Embed ref.
	 * @return array<string,string>|null
	 */
	private static function get_row_by_embed_ref( $embed_ref ) {
		global $wpdb;

		$table = BCEW_Chefs_Credentials::table_name();
		$row   = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT embed_ref, label, form_id_encrypted, api_key_encrypted FROM {$table} WHERE embed_ref = %s",
				sanitize_key( $embed_ref )
			),
			ARRAY_A
		);

		return is_array( $row ) ? $row : null;
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	private static function list_rows() {
		global $wpdb;

		$table  = BCEW_Chefs_Credentials::table_name();
		$exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) === $table;

		if ( ! $exists ) {
			return array();
		}

		$db_rows = $wpdb->get_results(
			"SELECT id, embed_ref, label, form_id_encrypted, api_key_encrypted, updated_at FROM {$table} ORDER BY id ASC",
			ARRAY_A
		);

		return is_array( $db_rows ) ? $db_rows : array();
	}
}
