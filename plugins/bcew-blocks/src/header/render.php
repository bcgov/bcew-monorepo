<?php
/**
 * Prints the saved header. The search is the plugin search when that
 * plugin is on, and the core search when it is off. The plugin search
 * stores no form in the page, so the form has to be drawn here.
 *
 * @package bcew-blocks
 *
 * @var WP_Block $block The header being rendered.
 */

$search_name = WP_Block_Type_Registry::get_instance()->is_registered( 'wordpress-search/search-bar' )
	? 'wordpress-search/search-bar'
	: 'core/search';

$search_attributes = array(
	'className' => 'bcew-blocks-header__search',
);

if ( 'core/search' === $search_name ) {
	$search_attributes['label']      = __( 'Search', 'bcew-blocks' );
	$search_attributes['showLabel']  = false;
	$search_attributes['buttonText'] = __( 'Search', 'bcew-blocks' );
}

$search_markup = render_block(
	array(
		'blockName'    => $search_name,
		'attrs'        => $search_attributes,
		'innerBlocks'  => array(),
		'innerHTML'    => '',
		'innerContent' => array(),
	)
);

$is_search = static function ( $inner ) {
	return 'core/search' === $inner->name || 'wordpress-search/search-bar' === $inner->name;
};

$rows = '';

foreach ( $block->inner_blocks as $inner ) {
	$class_name = isset( $inner->attributes['className'] ) ? (string) $inner->attributes['className'] : '';

	/*
	 * The theme header row is the logo, then the mobile menu, then the
	 * search. Draw that order here. An older header may still have the
	 * search saved between the logo and the menu. A header with the
	 * search turned off has no search block, so nothing is added.
	 */
	if ( false !== strpos( $class_name, 'bcew-blocks-header__logo-row' ) ) {
		$logo_markup   = '';
		$middle_markup = '';
		$search_html   = '';

		foreach ( $inner->inner_blocks as $child ) {
			if ( 'core/site-logo' === $child->name ) {
				$logo_markup .= $child->render();
			} elseif ( $is_search( $child ) ) {
				$search_html .= $search_markup;
			} else {
				$middle_markup .= $child->render();
			}
		}

		$rows .= '<div class="wp-block-group bcew-blocks-header__logo-row">';
		$rows .= $logo_markup . $middle_markup . $search_html;
		$rows .= '</div>';
		continue;
	}

	$rows .= $is_search( $inner ) ? $search_markup : $inner->render();
}

echo '<header ' . get_block_wrapper_attributes() . '>' . $rows . '</header>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
