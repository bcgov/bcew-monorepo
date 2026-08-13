<?php
/**
 * CHEFS admin settings page.
 *
 * Lets admins save form credentials and remove saved forms from the
 * credentials table (DSWP-1038).
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed;

// Block direct file access outside WordPress.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin settings for saved CHEFS credentials.
 *
 * UI lives here; database work stays in CredentialsManager.
 */
class Settings {

	/**
	 * Query-string page slug for admin.php?page=...
	 */
	const PAGE_SLUG = 'bcew-chefs-embed-settings';

	/**
	 * Register admin hooks (form POST handlers + plugin row links).
	 *
	 * Menu registration is separate (see register_menu) so it can run on admin_menu.
	 *
	 * @return void
	 */
	public function init() {
		// admin-post.php?action=bcew_chefs_save → handle_save().
		add_action( 'admin_post_bcew_chefs_save', array( $this, 'handle_save' ) );
		// admin-post.php?action=bcew_chefs_delete → handle_delete() (DSWP-1038).
		add_action( 'admin_post_bcew_chefs_delete', array( $this, 'handle_delete' ) );
		add_filter(
			'plugin_action_links_' . plugin_basename( dirname( __DIR__ ) . '/bcew-chefs-embed.php' ),
			array( $this, 'add_plugin_action_links' )
		);
	}

	/**
	 * Add Settings link to the plugin row on Plugins screen.
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
	 * Register the top-level CHEFS admin menu.
	 *
	 * Capability manage_options = administrators only (matches AC).
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
	 * Render the CHEFS settings page (save form + configured forms list).
	 *
	 * @return void
	 */
	public function render_page() {
		// Defense in depth: menu already requires manage_options.
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'bcew-chefs-embed' ) );
		}

		// List only needs form_id + created_at (no API keys on this screen).
		$forms = CredentialsManager::list_forms();
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

			<?php // --- Save new / update credentials --- ?>
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
							<th><?php esc_html_e( 'Date', 'bcew-chefs-embed' ); ?></th>
							<th><?php esc_html_e( 'Actions', 'bcew-chefs-embed' ); ?></th>
						</tr>
					</thead>
					<tbody>
					<?php foreach ( $forms as $form ) : ?>
						<tr>
							<td><code><?php echo esc_html( $form['form_id'] ); ?></code></td>
							<td>
								<?php
								// Format DB datetime with the site's date_format option.
								$timestamp = strtotime( $form['created_at'] );
								echo esc_html( $timestamp ? date_i18n( get_option( 'date_format' ), $timestamp ) : $form['created_at'] );
								?>
							</td>
							<td>
								<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline;">
									<?php wp_nonce_field( 'bcew_chefs_delete' ); ?>
									<input type="hidden" name="action" value="bcew_chefs_delete" />
									<input type="hidden" name="form_id" value="<?php echo esc_attr( $form['form_id'] ); ?>" />
									<?php
									submit_button(
										__( 'Remove', 'bcew-chefs-embed' ),
										'delete small',
										'submit',
										false
									);
									?>
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
	 * Handle save form submission (admin-post action bcew_chefs_save).
	 *
	 * @return void
	 */
	public function handle_save() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'bcew-chefs-embed' ) );
		}

		// Validates the nonce from wp_nonce_field( 'bcew_chefs_save' ).
		check_admin_referer( 'bcew_chefs_save' );

		// Sanitize POST input (never trust raw $_POST).
		$form_id = sanitize_text_field( wp_unslash( $_POST['form_id'] ?? '' ) );
		$api_key = sanitize_text_field( wp_unslash( $_POST['api_key'] ?? '' ) );

		$saved_form_id = CredentialsManager::save( $form_id, $api_key );
		$redirect_arg  = false === $saved_form_id ? 'chefs_error' : 'chefs_saved';

		wp_safe_redirect( add_query_arg( $redirect_arg, '1', self::get_page_url() ) );
		exit;
	}

	/**
	 * Handle remove form submission (admin-post action bcew_chefs_delete).
	 *
	 * Flow:
	 * 1. Capability check (manage_options only)
	 * 2. Nonce check (CSRF)
	 * 3. Sanitize form_id
	 * 4. Delete the DB row via CredentialsManager
	 * 5. Redirect back to settings with a success flag
	 *
	 * @return void
	 */
	public function handle_delete() {
		// AC: only users with manage_options can remove forms.
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'bcew-chefs-embed' ) );
		}

		// AC: admin_post + nonce — dies if nonce missing/invalid.
		check_admin_referer( 'bcew_chefs_delete' );

		$form_id = sanitize_text_field( wp_unslash( $_POST['form_id'] ?? '' ) );

		// Hard delete of that Form ID's row (no soft delete / archive).
		CredentialsManager::delete( $form_id );

		// PRG pattern: redirect so refresh does not re-POST delete.
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
