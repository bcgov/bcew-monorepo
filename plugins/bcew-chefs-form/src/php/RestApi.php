<?php
/**
 * REST API for CHEFS form embeds.
 *
 * @package bcew-chefs-form
 */

namespace Bcgov\BcewChefsForm;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Public embed-config endpoint for the block frontend.
 */
class RestApi {

	/**
	 * @var EmbedConfig
	 */
	private $embed_config;

	/**
	 * @param EmbedConfig|null $embed_config Embed config builder.
	 */
	public function __construct( EmbedConfig $embed_config = null ) {
		$this->embed_config = $embed_config ?? new EmbedConfig();
	}

	/**
	 * Register REST routes.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * @return void
	 */
	public function register_routes() {
		register_rest_route(
			'bcew-chefs/v1',
			'/embed-config',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => array( $this, 'get_embed_config' ),
				'args'                => array(
					'form_id' => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => array( Credentials::class, 'sanitize_form_id' ),
					),
				),
			)
		);
	}

	/**
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public function get_embed_config( $request ) {
		$form_id = Credentials::sanitize_form_id( $request->get_param( 'form_id' ) );
		$config  = $this->embed_config->get( $form_id );

		if ( ! $config['success'] ) {
			$config['settingsUrl'] = Settings::get_page_url();
		}

		return rest_ensure_response( $config );
	}
}
