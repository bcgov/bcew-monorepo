<?php
/**
 * CHEFS form options storage (confirmations, etc.).
 *
 * @package bcew-chefs-embed
 */

namespace Bcgov\BcewChefsEmbed;

/**
 * OptionsManager - additional per-form options (DSWP-1152).
 *
 * Table schema (`{prefix}bcew_chefs_options`):
 * - id (primary, auto-increment)
 * - chefs_credentials_id (CHEFS form ID)
 * - form_name (CHEFS form title)
 * - confirmation (string)
 */
class OptionsManager {
	use InstallsSiteTable;

	/**
	 * Options table schema version.
	 *
	 * Bump when table_definition() changes so existing installs re-run dbDelta.
	 */
	const DB_VERSION = '4';

	/**
	 * Option key storing the installed schema version.
	 */
	const DB_VERSION_OPTION = 'bcew_chefs_options_db_version';

	/**
	 * Options table name (with WP prefix for the current site).
	 *
	 * @return string
	 */
	public static function table_name() {
		global $wpdb;

		return $wpdb->prefix . 'bcew_chefs_options';
	}

	/**
	 * Look up a confirmation message by CHEFS form / credentials ID.
	 *
	 * @param string $chefs_credentials_id CHEFS form ID.
	 * @return string|null Confirmation text, or null when not found.
	 */
	public static function get_confirmation( $chefs_credentials_id ) {
		return self::get_option_value( 'confirmation', $chefs_credentials_id, true );
	}

	/**
	 * Look up the stored CHEFS form title.
	 *
	 * @param string $chefs_credentials_id CHEFS form ID.
	 * @return string|null Form title, or null when not found.
	 */
	public static function get_form_name( $chefs_credentials_id ) {
		return self::get_option_value( 'form_name', $chefs_credentials_id, true );
	}

	/**
	 * Retrieve an option value by column name.
	 *
	 * @param string  $column                Column name to select.
	 * @param string  $chefs_credentials_id  CHEFS form ID.
	 * @param boolean $trim_empty           Whether to return null for empty strings.
	 * @return string|null Column value, or null when not found or empty (if $trim_empty).
	 */
	private static function get_option_value( $column, $chefs_credentials_id, $trim_empty = false ) {
		global $wpdb;

		$chefs_credentials_id = self::sanitize_credentials_id( $chefs_credentials_id );
		if ( '' === $chefs_credentials_id ) {
			return null;
		}

		$table = self::table_name();

		$value = $wpdb->get_var(
			$wpdb->prepare(
				'SELECT %i FROM %i WHERE chefs_credentials_id = %s ORDER BY id DESC LIMIT 1',
				$column,
				$table,
				$chefs_credentials_id
			)
		);

		if ( ! is_string( $value ) ) {
			return null;
		}

		return $trim_empty && '' === trim( $value ) ? null : $value;
	}

	/**
	 * Save a CHEFS form title.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @param string $form_name CHEFS form title.
	 * @return string|false Form ID on success, false on failure.
	 */
	public static function save_form_name( $form_id, $form_name ) {
		global $wpdb;

		$form_id   = self::sanitize_credentials_id( $form_id );
		$form_name = trim( sanitize_text_field( (string) $form_name ) );

		if ( '' === $form_id || '' === $form_name ) {
			return false;
		}

		$table = self::table_name();

		/*
		 * Check whether this form already has an options row.
		 */
		$existing = self::form_exists( $table, $form_id );

		/*
		 * Update only the form_name, preserving the confirmation message.
		 * If no row exists yet, create one with form_name and an empty confirmation.
		 */
		if ( $existing ) {
			$result = $wpdb->update(
				$table,
				array( 'form_name' => $form_name ),
				array( 'chefs_credentials_id' => $form_id ),
				array( '%s' ),
				array( '%s' )
			);
		} else {
			$result = $wpdb->insert(
				$table,
				array(
					'chefs_credentials_id' => $form_id,
					'form_name'            => $form_name,
				),
				array( '%s', '%s' )
			);
		}

		return false === $result ? false : $form_id;
	}

	/**
	 * Create or update a confirmation message for a form.
	 *
	 * Both form ID and message are required. Clearing a message is `delete()`, not save.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @param string $message Confirmation text.
	 * @return string|false Form ID on success, false on failure.
	 */
	public static function save( $form_id, $message ) {
		global $wpdb;

		/*
		 * Sanitize the form ID and message so they are safe to store.
		 * A message that is only whitespace is treated as empty. If either
		 * value is empty, return false instead of saving a blank record.
		 * To remove an existing message, use delete().
		 */
		$form_id = self::sanitize_credentials_id( $form_id );
		$message = trim( sanitize_textarea_field( (string) $message ) );

		if ( '' === $form_id || '' === $message ) {
			return false;
		}

		$table = self::table_name();

		/*
		 * Check whether this form already has a confirmation message.
		 */
		$existing = self::form_exists( $table, $form_id );

		/*
		 * Update the existing message, or insert a new one if none exists yet.
		 */
		if ( $existing ) {
			$result = $wpdb->update(
				$table,
				array( 'confirmation' => $message ),
				array( 'chefs_credentials_id' => $form_id ),
				array( '%s' ),
				array( '%s' )
			);
		} else {
			$result = $wpdb->insert(
				$table,
				array(
					'chefs_credentials_id' => $form_id,
					'confirmation'         => $message,
				),
				array( '%s', '%s' )
			);
		}

		/*
		 * Return false only when the database reports an error. An update
		 * that does not change the text still counts as a successful save.
		 */
		return false === $result ? false : $form_id;
	}

	/**
	 * Delete all options for a form.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @return bool True when at least one row was deleted.
	 */
	public static function delete( $form_id ) {
		global $wpdb;

		/*
		 * Sanitize the form ID the same way save() and get_confirmation() do.
		 * An empty ID is not a valid lookup, so there is nothing to delete.
		 */
		$form_id = self::sanitize_credentials_id( $form_id );

		if ( '' === $form_id ) {
			return false;
		}

		$exists = self::form_exists( self::table_name(), $form_id );
		if ( ! $exists ) {
			return false;
		}

		/*
		 * Remove the confirmation row for this form. Return true only when
		 * at least one row was deleted.
		 */
		$deleted = $wpdb->delete(
			self::table_name(),
			array( 'chefs_credentials_id' => $form_id ),
			array( '%s' )
		);

		return false !== $deleted && $deleted > 0;
	}

	/**
	 * Clear a confirmation while preserving the form name.
	 *
	 * @param string $form_id CHEFS form ID.
	 * @return bool True when the options row exists and was updated.
	 */
	public static function clear_confirmation( $form_id ) {
		global $wpdb;

		$form_id = self::sanitize_credentials_id( $form_id );
		if ( '' === $form_id ) {
			return false;
		}

		$updated = $wpdb->update(
			self::table_name(),
			array( 'confirmation' => '' ),
			array( 'chefs_credentials_id' => $form_id ),
			array( '%s' ),
			array( '%s' )
		);

		return false !== $updated;
	}

	/**
	 * Normalize a credentials / form ID for storage and lookup.
	 *
	 * @param string $chefs_credentials_id CHEFS form ID.
	 * @return string
	 */
	private static function sanitize_credentials_id( $chefs_credentials_id ) {
		return trim( sanitize_text_field( $chefs_credentials_id ) );
	}

	/**
	 * Check whether an options row already exists for a form.
	 *
	 * @param string $table   Options table name.
	 * @param string $form_id CHEFS form ID.
	 * @return bool True when a matching row exists.
	 */
	private static function form_exists( $table, $form_id ) {
		global $wpdb;

		return (bool) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT 1 FROM %i WHERE chefs_credentials_id = %s LIMIT 1',
				$table,
				$form_id
			)
		);
	}

	/**
	 * Prepare the existing options table for the unique form ID index.
	 *
	 * Consolidates duplicate form ID rows, prioritizing:
	 * 1. Non-empty form_name or confirmation (preserves data)
	 * 2. Newest row by id (recency)
	 *
	 * Logs conflicts to error_log if duplicate rows have conflicting non-empty values.
	 *
	 * @return void
	 */
	protected static function before_table_install() {
		global $wpdb;

		$table = self::table_name();
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $wpdb->esc_like( $table ) ) ) !== $table ) {
			return;
		}

		$columns = $wpdb->get_col( "SHOW COLUMNS FROM `{$table}`", 0 ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name is generated internally.
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table and column names are generated internally.
		if ( ! in_array( 'form_name', $columns, true ) && false === $wpdb->query( "ALTER TABLE `{$table}` ADD COLUMN `form_name` varchar(255) NOT NULL DEFAULT ''" ) ) {
			return;
		}

		$indexes = $wpdb->get_results( "SHOW INDEX FROM `{$table}`", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name is generated internally.
		static::consolidate_duplicate_options_rows();
		foreach ( $indexes as $index ) {
			if ( 'chefs_credentials_id' !== $index['Key_name'] || '0' === (string) $index['Non_unique'] ) {
				continue;
			}

			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table and index names are generated internally.
			$wpdb->query( "ALTER TABLE `{$table}` DROP INDEX `chefs_credentials_id`" );
			break;
		}
	}

	/**
	 * Verify the options columns and unique form ID index after migration.
	 *
	 * @return bool
	 */
	protected static function table_schema_is_ready() {
		global $wpdb;

		$table   = self::table_name();
		$columns = $wpdb->get_col( "SHOW COLUMNS FROM `{$table}`", 0 ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name is generated internally.
		if ( ! in_array( 'form_name', $columns, true ) || ! in_array( 'confirmation', $columns, true ) ) {
			return false;
		}

		$indexes = $wpdb->get_results( "SHOW INDEX FROM `{$table}`", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name is generated internally.
		foreach ( $indexes as $index ) {
			if ( 'chefs_credentials_id' === $index['Key_name'] && '0' === (string) $index['Non_unique'] ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Consolidate duplicate form ID rows into keeper rows.
	 *
	 * Processes all rows, keeping the newest (highest id) for each form ID
	 * and merging non-empty fields from older rows. Logs conflicts.
	 *
	 * @return void
	 */
	private static function consolidate_duplicate_options_rows() {
		global $wpdb;

		$table = self::table_name();
		$rows  = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT id, chefs_credentials_id, form_name, confirmation FROM %i ORDER BY id DESC',
				$table
			),
			ARRAY_A
		);

		$seen_form_ids = array();
		$conflicts     = array();

		foreach ( $rows as $row ) {
			$form_id = $row['chefs_credentials_id'];
			if ( ! isset( $seen_form_ids[ $form_id ] ) ) {
				$seen_form_ids[ $form_id ] = (int) $row['id'];
				continue;
			}

			$keeper_id     = $seen_form_ids[ $form_id ];
			$row_conflicts = static::merge_duplicate_row( $keeper_id, $row );
			$conflicts     = array_merge( $conflicts, $row_conflicts );

			$wpdb->delete( $table, array( 'id' => (int) $row['id'] ), array( '%d' ) );
		}

		if ( ! empty( $conflicts ) ) {
			error_log( 'CHEFS Options table migration conflicts: ' . implode( '; ', $conflicts ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions -- Logging migration conflicts for admin visibility.
		}
	}

	/**
	 * Merge a duplicate row into its keeper row.
	 *
	 * Compares form_name and confirmation fields; updates keeper with
	 * non-empty values from the duplicate. Returns array of conflict messages.
	 *
	 * @param int   $keeper_id Keeper row ID.
	 * @param array $row       Duplicate row data.
	 * @return array Array of conflict strings (empty if no conflicts).
	 */
	private static function merge_duplicate_row( $keeper_id, array $row ) {
		global $wpdb;

		$table  = self::table_name();
		$keeper = $wpdb->get_row(
			$wpdb->prepare(
				'SELECT form_name, confirmation FROM %i WHERE id = %d',
				$table,
				$keeper_id
			),
			ARRAY_A
		);

		if ( ! $keeper ) {
			return array();
		}

		$updates   = array();
		$conflicts = array();

		// Merge form_name.
		$form_id             = $row['chefs_credentials_id'];
		$form_name_conflicts = static::merge_field( 'form_name', $keeper['form_name'], $row['form_name'], $updates );
		if ( $form_name_conflicts ) {
			$conflicts[] = "form_id={$form_id}: form_name conflict (keeping '{$keeper['form_name']}', discarding '{$row['form_name']}')";
		}

		// Merge confirmation.
		$confirmation_conflicts = static::merge_field( 'confirmation', $keeper['confirmation'], $row['confirmation'], $updates );
		if ( $confirmation_conflicts ) {
			$conflicts[] = "form_id={$form_id}: confirmation conflict (keeping first, discarding '{$row['confirmation']}')";
		}

		if ( $updates ) {
			$wpdb->update( $table, $updates, array( 'id' => $keeper_id ) );
		}

		return $conflicts;
	}

	/**
	 * Merge a field value from duplicate row into keeper.
	 *
	 * If both keeper and duplicate have non-empty values, returns true (conflict).
	 * If only duplicate has non-empty value, adds to updates array.
	 *
	 * @param string $field       Field name.
	 * @param string $keeper_val  Keeper field value.
	 * @param string $dup_val     Duplicate field value.
	 * @param array  $updates     Updates array (passed by reference).
	 * @return bool True if conflict (both non-empty and different), false otherwise.
	 */
	private static function merge_field( $field, $keeper_val, $dup_val, &$updates ) {
		if ( '' === $dup_val ) {
			return false;
		}

		if ( '' !== $keeper_val && $keeper_val !== $dup_val ) {
			return true; // Conflict: both non-empty and different.
		}

		if ( '' === $keeper_val ) {
			$updates[ $field ] = $dup_val;
		}

		return false;
	}

	/**
	 * Column and index definitions for the options table.
	 *
	 * @return string
	 */
	protected static function table_definition() {
		return '
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			chefs_credentials_id varchar(36) NOT NULL,
			form_name varchar(255) NOT NULL DEFAULT \'\',
			confirmation longtext NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY chefs_credentials_id (chefs_credentials_id)
		';
	}
}
