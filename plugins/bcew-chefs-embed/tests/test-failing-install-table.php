<?php
/**
 * Test fixture for the shared table-install failure path.
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed\Test;

/**
 * Test-only table consumer that forces dbDelta() to leave the table missing.
 */
class FailingInstallTable {
	use \Bcgov\BcewChefsEmbed\InstallsSiteTable;

	const DB_VERSION        = 'test';
	const DB_VERSION_OPTION = 'bcew_test_failing_install_db_version';

	/**
	 * Return an isolated table name for the failure-path test.
	 *
	 * @return string
	 */
	public static function table_name() {
		global $wpdb;

		return $wpdb->prefix . 'bcew_test_failing_install';
	}

	/**
	 * Return invalid DDL so dbDelta() cannot create the table.
	 *
	 * @return string
	 */
	protected static function table_definition() {
		return 'this is not valid table definition';
	}
}
