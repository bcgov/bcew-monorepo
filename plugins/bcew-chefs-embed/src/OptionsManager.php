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
	const DB_VERSION = '2';

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
		return self::get_option_value( 'confirmation', $chefs_credentials_id );
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

		$table  = self::table_name();
		$result = $wpdb->replace(
			$table,
			array(
				'chefs_credentials_id' => $form_id,
				'form_name'            => $form_name,
				'confirmation'         => '',
			),
			array( '%s', '%s', '%s' )
		);

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
		$existing = (bool) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT 1 FROM %i WHERE chefs_credentials_id = %s LIMIT 1',
				$table,
				$form_id
			)
		);

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
	 * Delete a confirmation message for a form.
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
	 * Normalize a credentials / form ID for storage and lookup.
	 *
	 * @param string $chefs_credentials_id CHEFS form ID.
	 * @return string
	 */
	private static function sanitize_credentials_id( $chefs_credentials_id ) {
		return trim( sanitize_text_field( $chefs_credentials_id ) );
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
			KEY chefs_credentials_id (chefs_credentials_id)
		';
	}
}
