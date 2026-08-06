<?php
/**
 * CHEFS admin settings page.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin settings for saved CHEFS credentials.
 */
class Settings {
	const PAGE_SLUG = 'bcew-chefs-embed-settings';

	/**
	 * Register admin hooks.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'admin_post_bcew_chefs_save', array( $this, 'handle_save' ) );
		add_action( 'admin_post_bcew_chefs_delete', array( $this, 'handle_delete' ) );
		add_filter(
			'plugin_action_links_' . plugin_basename( dirname( __DIR__ ) . '/bcew-chefs-embed.php' ),
			array( $this, 'add_plugin_action_links' )
		);
	}

	/**
	 * Add Settings link to the plugin row.
	 *
	 * @param array $links Existing plugin action links.
	 * @return array
	 */
	public function add_plugin_action_links( array $links ) {
		$settings_link = sprintf(
			'<a href="%s">%s</a>',
			esc_url( self::get_page_url() ),
			esc_html__( 'Settings', 'bcew-chefs-embed' )
		);
		array_unshift( $links, $settings_link );
		return $links;
	}

	/**
	 * Register the CHEFS menu.
	 *
	 * @return void
	 */
	public function register_menu() {
		add_menu_page(
			__( 'CHEFS Forms', 'bcew-chefs-embed' ),
			__( 'CHEFS Forms', 'bcew-chefs-embed' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render_page' ),
			'dashicons-feedback',
			58
		);
	}

	/**
	 * Render the CHEFS settings page.
	 *
	 * @return void
	 */
	public function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'bcew-chefs-embed' ) );
		}

		$forms = Credentials::list_forms();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'CHEFS Settings', 'bcew-chefs-embed' ); ?></h1>
			<p class="description">
				<?php esc_html_e( 'Form IDs are stored for block lookup. API keys are stored in the database and are not shown again after save.', 'bcew-chefs-embed' ); ?>
			</p>

			<?php // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only redirect status flag. ?>
			<?php if ( isset( $_GET['chefs_saved'] ) ) : ?>
				<div class="notice notice-success"><p><?php esc_html_e( 'Saved.', 'bcew-chefs-embed' ); ?></p></div>
			<?php // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only redirect status flag. ?>
			<?php elseif ( isset( $_GET['chefs_error'] ) ) : ?>
				<div class="notice notice-error"><p><?php esc_html_e( 'Unable to save credentials.', 'bcew-chefs-embed' ); ?></p></div>
			<?php // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only redirect status flag. ?>
			<?php elseif ( isset( $_GET['chefs_deleted'] ) ) : ?>
				<div class="notice notice-success"><p><?php esc_html_e( 'Removed.', 'bcew-chefs-embed' ); ?></p></div>
			<?php endif; ?>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<?php wp_nonce_field( 'bcew_chefs_save' ); ?>
				<input type="hidden" name="action" value="bcew_chefs_save" />

				<table class="form-table">
					<tr>
						<th><label for="form_id"><?php esc_html_e( 'Form ID', 'bcew-chefs-embed' ); ?></label></th>
						<td><input type="text" class="regular-text code" id="form_id" name="form_id" required autocomplete="off" placeholder="xxxxxxxx-xxxx-4xxx-xxxx-xxxxxxxxxxxx" /></td>
					</tr>
					<tr>
						<th><label for="api_key"><?php esc_html_e( 'API Key', 'bcew-chefs-embed' ); ?></label></th>
						<td><input type="password" class="regular-text" id="api_key" name="api_key" required autocomplete="new-password" /></td>
					</tr>
				</table>

				<?php submit_button( __( 'Save', 'bcew-chefs-embed' ) ); ?>
			</form>

			<?php if ( $forms ) : ?>
				<h2><?php esc_html_e( 'Configured Forms', 'bcew-chefs-embed' ); ?></h2>
				<table class="widefat striped" style="max-width:720px">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Form ID', 'bcew-chefs-embed' ); ?></th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $forms as $form_id ) : ?>
							<tr>
								<td><code><?php echo esc_html( $form_id ); ?></code></td>
								<td>
									<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display: inline;">
										<?php wp_nonce_field( 'bcew_chefs_delete' ); ?>
										<input type="hidden" name="action" value="bcew_chefs_delete" />
										<input type="hidden" name="form_id" value="<?php echo esc_attr( $form_id ); ?>" />
										<?php submit_button( __( 'Remove', 'bcew-chefs-embed' ), 'delete small', 'submit', false ); ?>
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
	 * Handle save form submission.
	 *
	 * @return void
	 */
	public function handle_save() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'bcew-chefs-embed' ) );
		}

		check_admin_referer( 'bcew_chefs_save' );

		$form_id = sanitize_text_field( wp_unslash( $_POST['form_id'] ?? '' ) );
		$api_key = sanitize_text_field( wp_unslash( $_POST['api_key'] ?? '' ) );

		$saved_form_id = Credentials::save( $form_id, $api_key );
		$redirect_arg  = false === $saved_form_id ? 'chefs_error' : 'chefs_saved';

		wp_safe_redirect( add_query_arg( $redirect_arg, '1', self::get_page_url() ) );
		exit;
	}

	/**
	 * Handle delete form submission.
	 *
	 * @return void
	 */
	public function handle_delete() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'bcew-chefs-embed' ) );
		}

		check_admin_referer( 'bcew_chefs_delete' );

		$form_id = Credentials::sanitize_form_id( wp_unslash( $_POST['form_id'] ?? '' ) );

		Credentials::delete( $form_id );

		wp_safe_redirect( add_query_arg( 'chefs_deleted', '1', self::get_page_url() ) );
		exit;
	}

	/**
	 * Get the CHEFS settings page URL.
	 *
	 * @return string
	 */
	public static function get_page_url() {
		return admin_url( 'admin.php?page=' . self::PAGE_SLUG );
	}
}
