<?php
/**
 * Load the CHEFS mock in the Playwright test WordPress instance only.
 *
 * @package bcew-chefs-embed
 */

if ( defined( 'BCEW_CHEFS_E2E_MOCK' ) && BCEW_CHEFS_E2E_MOCK ) {
	require_once WP_PLUGIN_DIR . '/bcew-chefs-embed/tests/E2eChefsMock.php';
	add_filter( 'pre_http_request', array( \Bcgov\BcewChefsEmbed\E2eChefsMock::class, 'pre_http_request' ), 10, 3 );
}
