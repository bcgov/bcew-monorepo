/**
 * Global setup for e2e tests.
 * Activates the plugin via REST API before tests run.
 */

async function globalSetup() {
	const baseURL = process.env.WP_BASE_URL || 'http://localhost:8889';
	const username = process.env.WP_AUTH_LOGIN || 'admin';
	const password = process.env.WP_AUTH_PASSWORD || 'password';

	try {
		// Get WordPress nonce for authentication
		const loginResponse = await fetch( `${ baseURL }/wp-login.php`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams( {
				log: username,
				pwd: password,
				'wp-submit': 'Log In',
				redirect_to: `${ baseURL }/wp-admin/`,
				testcookie: '1',
			} ).toString(),
			redirect: 'follow',
		} );

		// Activate the plugin via REST
		const pluginPath = 'bcew-chefs-embed/bcew-chefs-embed';
		const activateResponse = await fetch(
			`${ baseURL }/wp-json/wp/v2/plugins/${ pluginPath }/activate`,
			{
				method: 'POST',
				credentials: 'include',
			}
		);

		if ( ! activateResponse.ok ) {
			console.warn(
				`Warning: Plugin activation via REST returned ${ activateResponse.status }. ` +
					'Tests may proceed if plugin is already active.'
			);
		} else {
			console.log( 'Plugin activated successfully via REST API.' );
		}
	} catch ( error ) {
		console.warn(
			'Warning: Could not activate plugin via REST during setup.',
			error.message
		);
		// Don't fail setup—tests may still work if plugin is already active
	}
}

export default globalSetup;
