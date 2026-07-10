<?php
/**
 * Server-side storage for CHEFS form credentials.
 *
 * @package bcew-chefs-form
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages CHEFS API credentials for the site.
 */
class BCEW_Chefs_Credentials {

	const OPTION_KEY = 'bcew_chefs_forms';

	/**
	 * Get a stored form record by embed reference.
	 *
	 * @param string $embed_ref Opaque embed reference.
	 * @return array{form_id:string,api_key:string,label:string}|null
	 */
	public static function get_by_embed_ref( $embed_ref ) {
		$embed_ref = sanitize_key( $embed_ref );

		if ( '' === $embed_ref ) {
			return null;
		}

		$forms = get_option( self::OPTION_KEY, array() );

		return is_array( $forms ) ? ( $forms[ $embed_ref ] ?? null ) : null;
	}

	/**
	 * Save or update credentials for a CHEFS form.
	 *
	 * @param string $form_id CHEFS form UUID.
	 * @param string $api_key Form API key.
	 * @param string $label   Optional admin label.
	 * @return string|false Embed reference on success.
	 */
	public static function save( $form_id, $api_key, $label = '' ) {
		$form_id = strtolower( trim( $form_id ) );
		$api_key = trim( $api_key );
		$label   = sanitize_text_field( $label );

		if ( ! self::is_valid_form_id( $form_id ) || '' === $api_key ) {
			return false;
		}

		$forms     = get_option( self::OPTION_KEY, array() );
		$forms     = is_array( $forms ) ? $forms : array();
		$embed_ref = self::find_embed_ref_for_form_id( $form_id, $forms ) ?: bin2hex( random_bytes( 16 ) );

		$forms[ $embed_ref ] = array(
			'form_id' => $form_id,
			'api_key' => $api_key,
			'label'   => $label ? $label : sprintf( 'CHEFS form …%s', substr( $form_id, -8 ) ),
		);

		return update_option( self::OPTION_KEY, $forms, false ) ? $embed_ref : false;
	}

	/**
	 * Remove a form by embed reference.
	 *
	 * @param string $embed_ref Opaque embed reference.
	 * @return bool
	 */
	public static function delete( $embed_ref ) {
		$embed_ref = sanitize_key( $embed_ref );
		$forms     = get_option( self::OPTION_KEY, array() );

		if ( ! is_array( $forms ) || ! isset( $forms[ $embed_ref ] ) ) {
			return false;
		}

		unset( $forms[ $embed_ref ] );

		return update_option( self::OPTION_KEY, $forms, false );
	}

	/**
	 * List configured forms.
	 *
	 * @param bool $include_form_id Include CHEFS UUID (admin UI only).
	 * @return array<int,array<string,string>>
	 */
	public static function list_forms( $include_form_id = true ) {
		$forms = get_option( self::OPTION_KEY, array() );
		$list  = array();

		if ( ! is_array( $forms ) ) {
			return $list;
		}

		foreach ( $forms as $embed_ref => $record ) {
			$item = array(
				'embedRef' => $embed_ref,
				'label'    => $record['label'] ?? sprintf( 'CHEFS form …%s', substr( $record['form_id'], -8 ) ),
			);

			if ( $include_form_id ) {
				$item['embed_ref'] = $embed_ref;
				$item['form_id']   = $record['form_id'];
			}

			$list[] = $item;
		}

		return $list;
	}

	/**
	 * Validate a CHEFS form UUID.
	 *
	 * @param string $form_id Form ID.
	 * @return bool
	 */
	public static function is_valid_form_id( $form_id ) {
		return (bool) preg_match(
			'/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i',
			$form_id
		);
	}

	/**
	 * Validate an embed reference.
	 *
	 * @param string $embed_ref Embed reference.
	 * @return bool
	 */
	public static function is_valid_embed_ref( $embed_ref ) {
		return (bool) preg_match( '/^[a-f0-9]{32}$/i', $embed_ref );
	}

	/**
	 * @param string                            $form_id CHEFS form UUID.
	 * @param array<string,array<string,string>> $forms   Stored forms.
	 * @return string|null
	 */
	private static function find_embed_ref_for_form_id( $form_id, $forms ) {
		foreach ( $forms as $embed_ref => $record ) {
			if ( ( $record['form_id'] ?? '' ) === $form_id ) {
				return $embed_ref;
			}
		}

		return null;
	}
}
