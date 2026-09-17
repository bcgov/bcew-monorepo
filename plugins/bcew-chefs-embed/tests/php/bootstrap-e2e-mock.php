<?php
/**
 * E2E test bootstrap - registers the CHEFS HTTP mock.
 *
 * Loaded by wp-env when BCEW_CHEFS_E2E_MOCK is defined.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

if ( ! defined( 'BCEW_CHEFS_E2E_MOCK' ) || ! BCEW_CHEFS_E2E_MOCK ) {
	return;
}

// E2E tests run against a local wp-env and must not depend on the live CHEFS
// service. The mock is enabled only by the test environment via wp-env config.
add_filter( 'pre_http_request', array( E2eChefsMock::class, 'pre_http_request' ), 10, 3 );
