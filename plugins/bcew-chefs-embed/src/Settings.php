<?php
/**
 * CHEFS admin settings page.
 *
 * Lets admins save form credentials, custom confirmation messages, and
 * remove saved forms from the credentials table (DSWP-1038, DSWP-1150).
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
 * UI lives here; database work stays in CredentialsManager and OptionsManager.
 */
class Settings {

	/**
	 * Query-string page slug for admin.php?page=...
	 */
	const PAGE_SLUG = 'bcew-chefs-embed-settings';

	/**
	 * Visitor-facing generic success heading. Must match view.js.
	 */
	const GENERIC_SUCCESS_HEADING = 'Success';

	/**
	 * Visitor-facing generic success body. Must match view.js.
	 */
	const GENERIC_SUCCESS_BODY = 'Your form has been submitted successfully';

	/**
	 * Public documentation URL for this plugin.
	 */
	const DOCUMENTATION_URL = 'https://bcgov.github.io/bcew-monorepo/docs/content/plugins/bcew-chefs-embed/';

	/**
	 * Admin submenu slug for the Documentation entry.
	 */
	const DOCUMENTATION_SUBMENU_SLUG = 'bcew-chefs-embed-documentation';

	/**
	 * Register admin hooks (form handlers + admin links behavior).
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
		add_action( 'admin_post_bcew_chefs_save_confirmation', array( $this, 'handle_save_confirmation' ) );
		add_action( 'admin_post_bcew_chefs_delete_confirmation', array( $this, 'handle_delete_confirmation' ) );
		add_filter(
			'plugin_action_links_' . plugin_basename( dirname( __DIR__ ) . '/bcew-chefs-embed.php' ),
			array( $this, 'add_plugin_action_links' )
		);
		add_filter( 'allowed_redirect_hosts', array( $this, 'allow_documentation_redirect_host' ) );
		add_action( 'admin_footer', array( $this, 'decorate_documentation_submenu_link' ) );
	}

	/**
	 * Add Settings and Documentation links to the plugin row on Plugins screen.
	 *
	 * @param array $links Existing plugin action links.
	 * @return array
	 */
	public function add_plugin_action_links( array $links ) {
		$settings_link      = sprintf(
			'<a href="%s">%s</a>',
			esc_url( self::get_page_url() ),
			esc_html__( 'Settings', 'bcew-chefs-embed' )
		);
		$documentation_link = sprintf(
			'<a href="%s">%s</a>',
			esc_url( self::get_documentation_url() ),
			esc_html__( 'Documentation', 'bcew-chefs-embed' )
		);
		array_unshift( $links, $settings_link, $documentation_link );
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

		add_submenu_page(
			self::PAGE_SLUG,
			__( 'CHEFS Settings', 'bcew-chefs-embed' ),
			__( 'Settings', 'bcew-chefs-embed' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render_page' )
		);

		add_submenu_page(
			self::PAGE_SLUG,
			__( 'Documentation', 'bcew-chefs-embed' ),
			__( 'Documentation', 'bcew-chefs-embed' ),
			'manage_options',
			self::DOCUMENTATION_SUBMENU_SLUG,
			array( $this, 'render_documentation_page' )
		);
	}

	/**
	 * Render the Documentation submenu page.
	 *
	 * Fallback: if JS link decoration does not run, opening this submenu
	 * still redirects to the public documentation URL.
	 *
	 * @return void
	 */
	public function render_documentation_page() {
		wp_safe_redirect( self::get_documentation_url() );
		exit;
	}

	/**
	 * Make the Documentation submenu open the public docs in a new tab.
	 *
	 * @return void
	 */
	public function decorate_documentation_submenu_link() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<script>
			(function() {
				const docsLink = document.querySelector(
					'#toplevel_page_<?php echo esc_js( self::PAGE_SLUG ); ?> a[href*="page=<?php echo esc_js( self::DOCUMENTATION_SUBMENU_SLUG ); ?>"]'
				);

				if ( ! docsLink ) {
					return;
				}

				docsLink.setAttribute( 'href', '<?php echo esc_js( self::get_documentation_url() ); ?>' );
				docsLink.setAttribute( 'target', '_blank' );
				docsLink.setAttribute( 'rel', 'noopener noreferrer' );
			})();
		</script>
		<?php
	}

	/**
	 * Allow safe redirects to the configured public documentation host.
	 *
	 * @param array $hosts Allowed redirect hosts.
	 * @return array
	 */
	public function allow_documentation_redirect_host( array $hosts ) {
		$documentation_host = wp_parse_url( self::get_documentation_url(), PHP_URL_HOST );

		if ( ! is_string( $documentation_host ) || '' === $documentation_host ) {
			return $hosts;
		}

		if ( ! in_array( $documentation_host, $hosts, true ) ) {
			$hosts[] = $documentation_host;
		}

		return $hosts;
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
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only edit-mode flag.
		$editing_form_id = isset( $_GET['edit_confirmation'] ) ? sanitize_text_field( wp_unslash( $_GET['edit_confirmation'] ) ) : '';
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'CHEFS Settings', 'bcew-chefs-embed' ); ?></h1>
			<p class="description">
				<?php esc_html_e( 'Form IDs are stored for block lookup. API keys are stored in the database and are not shown again after save.', 'bcew-chefs-embed' ); ?>
			</p>
			<p class="description">
				<?php esc_html_e( 'For information and help please view the ', 'bcew-chefs-embed' ); ?><a href="<?php echo esc_url( self::get_documentation_url() ); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'documentation', 'bcew-chefs-embed' ); ?></a>.
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
			<?php // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only redirect status flag. ?>
			<?php elseif ( isset( $_GET['chefs_confirmation_saved'] ) ) : ?>
				<div class="notice notice-success"><p><?php esc_html_e( 'Confirmation message saved.', 'bcew-chefs-embed' ); ?></p></div>
			<?php // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only redirect status flag. ?>
			<?php elseif ( isset( $_GET['chefs_confirmation_cleared'] ) ) : ?>
				<div class="notice notice-success"><p><?php esc_html_e( 'Custom confirmation deleted. The generic success message will be used.', 'bcew-chefs-embed' ); ?></p></div>
			<?php // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only redirect status flag. ?>
			<?php elseif ( isset( $_GET['chefs_confirmation_error'] ) ) : ?>
				<div class="notice notice-error"><p><?php esc_html_e( 'Unable to save the confirmation message. Enter a message, or use Remove custom confirmation to remove one.', 'bcew-chefs-embed' ); ?></p></div>
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
				<p class="description">
					<?php esc_html_e( 'A custom confirmation is shown after someone submits that form. If none is saved, visitors see the generic message below.', 'bcew-chefs-embed' ); ?>
				</p>
				<div class="notice notice-info inline" style="margin: 0 0 12px; max-width: 720px;">
					<p>
						<strong><?php echo esc_html( self::GENERIC_SUCCESS_HEADING ); ?></strong><br />
						<?php echo esc_html( self::GENERIC_SUCCESS_BODY ); ?>
					</p>
				</div>
				<table class="widefat striped">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Form ID', 'bcew-chefs-embed' ); ?></th>
							<th><?php esc_html_e( 'Date', 'bcew-chefs-embed' ); ?></th>
							<th><?php esc_html_e( 'Confirmation', 'bcew-chefs-embed' ); ?></th>
							<th><?php esc_html_e( 'Actions', 'bcew-chefs-embed' ); ?></th>
						</tr>
					</thead>
					<tbody>
					<?php foreach ( $forms as $form ) : ?>
						<?php
						$confirmation = OptionsManager::get_confirmation( $form['form_id'] );
						$is_editing   = $editing_form_id === $form['form_id'];
						$save_form_id = 'bcew-chefs-save-confirmation-' . $form['form_id'];
						?>
						<tr>
							<td><code><?php echo esc_html( $form['form_id'] ); ?></code></td>
							<td>
								<?php
								$timestamp = strtotime( $form['created_at'] );
								echo esc_html( $timestamp ? date_i18n( get_option( 'date_format' ), $timestamp ) : $form['created_at'] );
								?>
							</td>
							<td>
								<?php if ( $is_editing ) : ?>
									<form
										id="<?php echo esc_attr( $save_form_id ); ?>"
										method="post"
										action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>"
									>
										<?php wp_nonce_field( 'bcew_chefs_save_confirmation' ); ?>
										<input type="hidden" name="action" value="bcew_chefs_save_confirmation" />
										<input type="hidden" name="form_id" value="<?php echo esc_attr( $form['form_id'] ); ?>" />
										<label class="screen-reader-text" for="confirmation-<?php echo esc_attr( $form['form_id'] ); ?>">
											<?php esc_html_e( 'Confirmation message', 'bcew-chefs-embed' ); ?>
										</label>
										<textarea
											id="confirmation-<?php echo esc_attr( $form['form_id'] ); ?>"
											name="confirmation"
											class="large-text"
											rows="3"
											required
										><?php echo esc_textarea( (string) $confirmation ); ?></textarea>
									</form>
								<?php elseif ( $confirmation ) : ?>
									<p><?php echo nl2br( esc_html( $confirmation ), false ); ?></p>
								<?php else : ?>
									<p class="description">
										<?php esc_html_e( 'There is no custom confirmation for this form. The generic message will be used.', 'bcew-chefs-embed' ); ?>
									</p>
								<?php endif; ?>
							</td>
							<td>
								<div style="display:flex;flex-direction:column;align-items:flex-start;gap:8px;">
									<?php if ( $is_editing ) : ?>
										<?php
										submit_button(
											__( 'Save confirmation', 'bcew-chefs-embed' ),
											'primary small',
											'submit',
											false,
											array(
												'form' => $save_form_id,
											)
										);
										?>
									<?php else : ?>
										<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
											<?php wp_nonce_field( 'bcew_chefs_delete' ); ?>
											<input type="hidden" name="action" value="bcew_chefs_delete" />
											<input type="hidden" name="form_id" value="<?php echo esc_attr( $form['form_id'] ); ?>" />
											<?php
											submit_button(
												__( 'Remove form', 'bcew-chefs-embed' ),
												'delete small',
												'submit',
												false
											);
											?>
										</form>
										<?php if ( $confirmation ) : ?>
											<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
												<?php wp_nonce_field( 'bcew_chefs_delete_confirmation' ); ?>
												<input type="hidden" name="action" value="bcew_chefs_delete_confirmation" />
												<input type="hidden" name="form_id" value="<?php echo esc_attr( $form['form_id'] ); ?>" />
												<?php
												submit_button(
													__( 'Remove custom confirmation', 'bcew-chefs-embed' ),
													'delete small',
													'submit',
													false,
													array(
														'onclick' => 'return confirm( ' . wp_json_encode( __( 'Remove this custom confirmation? The generic success message will be used instead.', 'bcew-chefs-embed' ) ) . ' );',
													)
												);
												?>
											</form>
										<?php endif; ?>
										<a
											class="button button-small"
											href="<?php echo esc_url( add_query_arg( 'edit_confirmation', $form['form_id'], self::get_page_url() ) ); ?>"
										>
											<?php esc_html_e( 'Edit confirmation', 'bcew-chefs-embed' ); ?>
										</a>
									<?php endif; ?>
								</div>
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
	 * Save or update a custom confirmation message for a saved form (DSWP-1150).
	 *
	 * @return void
	 */
	public function handle_save_confirmation() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'bcew-chefs-embed' ) );
		}

		check_admin_referer( 'bcew_chefs_save_confirmation' );

		$form_id = sanitize_text_field( wp_unslash( $_POST['form_id'] ?? '' ) );
		$message = sanitize_textarea_field( wp_unslash( $_POST['confirmation'] ?? '' ) );

		$saved        = OptionsManager::save( $form_id, $message );
		$redirect_arg = false === $saved ? 'chefs_confirmation_error' : 'chefs_confirmation_saved';

		wp_safe_redirect( add_query_arg( $redirect_arg, '1', self::get_page_url() ) );
		exit;
	}

	/**
	 * Remove a custom confirmation so the form uses the generic success message.
	 *
	 * @return void
	 */
	public function handle_delete_confirmation() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Unauthorized.', 'bcew-chefs-embed' ) );
		}

		check_admin_referer( 'bcew_chefs_delete_confirmation' );

		$form_id = sanitize_text_field( wp_unslash( $_POST['form_id'] ?? '' ) );

		OptionsManager::delete( $form_id );

		wp_safe_redirect( add_query_arg( 'chefs_confirmation_cleared', '1', self::get_page_url() ) );
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

	/**
	 * Get the public documentation URL for the CHEFS plugin.
	 *
	 * @return string
	 */
	public static function get_documentation_url() {
		return self::DOCUMENTATION_URL;
	}
}
