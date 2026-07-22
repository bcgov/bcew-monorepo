<?php
/**
 * CHEFS Forms admin page.
 *
 * @package bcew-chefs-form
 */

namespace Bcgov\BcewChefsForm;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin settings for saved CHEFS credentials.
 */
class Settings {

	const PAGE_SLUG = 'bcew-chefs-form-settings';

	/**
	 * @var Gateway
	 */
	private $gateway;

	/**
	 * @param Gateway|null $gateway Gateway client.
	 */
	public function __construct( Gateway $gateway = null ) {
		$this->gateway = $gateway ?? new Gateway();
	}

	/**
	 * Register admin hooks.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_menu', array( $this, 'register_menu' ) );
		add_action( 'admin_post_bcew_chefs_save', array( $this, 'handle_save' ) );
		add_action( 'admin_post_bcew_chefs_delete', array( $this, 'handle_delete' ) );
		add_filter(
			'plugin_action_links_' . plugin_basename( BCEW_CHEFS_FORM_PLUGIN_FILE ),
			array( $this, 'add_plugin_action_links' )
		);
	}

	/**
	 * @param array<int,string> $links Plugin action links.
	 * @return array<int,string>
	 */
	public function add_plugin_action_links( $links ) {
		$links[] = '<a href="' . esc_url( self::get_page_url() ) . '">' . esc_html__( 'Settings', 'bcew-chefs-form' ) . '</a>';
		return $links;
	}

	/**
	 * @return void
	 */
	public function register_menu() {
		add_menu_page(
			__( 'CHEFS Forms', 'bcew-chefs-form' ),
			__( 'CHEFS Forms', 'bcew-chefs-form' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render_page' ),
			'dashicons-feedback',
			58
		);
	}

	/**
	 * @return void
	 */
	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'bcew-chefs-form' ) );
		}

		$error = isset( $_GET['chefs_error'] ) ? sanitize_text_field( wp_unslash( $_GET['chefs_error'] ) ) : '';
		$forms = Credentials::list_forms();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'CHEFS Forms', 'bcew-chefs-form' ); ?></h1>
			<p class="description">
				<?php esc_html_e( 'Form IDs are stored for block lookup. API keys are encrypted in the database and are not shown again after save.', 'bcew-chefs-form' ); ?>
			</p>

			<?php if ( $error ) : ?>
				<div class="notice notice-error"><p><?php echo esc_html( $error ); ?></p></div>
			<?php elseif ( isset( $_GET['chefs_saved'] ) ) : ?>
				<div class="notice notice-success"><p><?php esc_html_e( 'Saved.', 'bcew-chefs-form' ); ?></p></div>
			<?php elseif ( isset( $_GET['chefs_deleted'] ) ) : ?>
				<div class="notice notice-success"><p><?php esc_html_e( 'Removed.', 'bcew-chefs-form' ); ?></p></div>
			<?php endif; ?>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<?php wp_nonce_field( 'bcew_chefs_save' ); ?>
				<input type="hidden" name="action" value="bcew_chefs_save" />
				<table class="form-table">
					<tr>
						<th><label for="form_id"><?php esc_html_e( 'Form ID', 'bcew-chefs-form' ); ?></label></th>
						<td><input type="text" class="regular-text code" id="form_id" name="form_id" required autocomplete="off" /></td>
					</tr>
					<tr>
						<th><label for="api_key"><?php esc_html_e( 'API key', 'bcew-chefs-form' ); ?></label></th>
						<td><input type="password" class="regular-text" id="api_key" name="api_key" required autocomplete="new-password" /></td>
					</tr>
				</table>
				<?php submit_button( __( 'Save', 'bcew-chefs-form' ) ); ?>
			</form>

			<?php if ( $forms ) : ?>
				<h2><?php esc_html_e( 'Configured forms', 'bcew-chefs-form' ); ?></h2>
				<table class="widefat striped" style="max-width:720px">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Form ID', 'bcew-chefs-form' ); ?></th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $forms as $form_id ) : ?>
							<tr>
								<td><code><?php echo esc_html( $form_id ); ?></code></td>
								<td>
									<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
										<?php wp_nonce_field( 'bcew_chefs_delete' ); ?>
										<input type="hidden" name="action" value="bcew_chefs_delete" />
										<input type="hidden" name="form_id" value="<?php echo esc_attr( $form_id ); ?>" />
										<?php submit_button( __( 'Remove', 'bcew-chefs-form' ), 'delete small', 'submit', false ); ?>
									</form>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * @return void
	 */
	public function handle_save() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'bcew-chefs-form' ) );
		}

		check_admin_referer( 'bcew_chefs_save' );

		$form_id = sanitize_text_field( wp_unslash( $_POST['form_id'] ?? '' ) );
		$api_key = sanitize_text_field( wp_unslash( $_POST['api_key'] ?? '' ) );

		if ( ! Credentials::is_valid_form_id( $form_id ) ) {
			$this->redirect_error( __( 'Invalid form ID.', 'bcew-chefs-form' ) );
		}

		$token = $this->gateway->get_token( $form_id, $api_key );

		if ( empty( $token['token'] ) ) {
			$this->redirect_error( $token['error'] ?? __( 'Could not validate with CHEFS.', 'bcew-chefs-form' ) );
		}

		$saved_form_id = Credentials::save( $form_id, $api_key );

		if ( ! $saved_form_id ) {
			$this->redirect_error( __( 'Could not save.', 'bcew-chefs-form' ) );
		}

		wp_safe_redirect( add_query_arg( 'chefs_saved', '1', self::get_page_url() ) );
		exit;
	}

	/**
	 * @return void
	 */
	public function handle_delete() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'bcew-chefs-form' ) );
		}

		check_admin_referer( 'bcew_chefs_delete' );
		Credentials::delete( Credentials::sanitize_form_id( wp_unslash( $_POST['form_id'] ?? '' ) ) );
		wp_safe_redirect( add_query_arg( 'chefs_deleted', '1', self::get_page_url() ) );
		exit;
	}

	/**
	 * @return string
	 */
	public static function get_page_url() {
		return admin_url( 'admin.php?page=' . self::PAGE_SLUG );
	}

	/**
	 * @param string $message Error message.
	 * @return void
	 */
	private function redirect_error( $message ) {
		wp_safe_redirect( add_query_arg( 'chefs_error', rawurlencode( $message ), self::get_page_url() ) );
		exit;
	}
}
