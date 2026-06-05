/**
 * Shared accessibility helpers for the Icon block (editor + save).
 */

import { __ } from '@wordpress/i18n';
import { ICON_ALLOWLIST_MAP } from './icon-allowlist';
import { isDecorativeMode } from './icon-classes';

/**
 * Accessible name for a meaningful icon: custom text, allowlist label, or fallback.
 *
 * @param {Object} props                  Data used to compute the icon's spoken label.
 * @param {string} [props.accessibleName] Custom name from the block attribute.
 * @param {string} [props.iconId]         Selected allowlist id.
 * @return {string} Normalized accessible label for informative icon mode.
 */
export const getInformativeLabel = ( { accessibleName, iconId } ) => {
    const trimmed =
        'string' === typeof accessibleName ? accessibleName.trim() : '';
    const selectedIcon = ICON_ALLOWLIST_MAP[ iconId ];
    return trimmed || selectedIcon?.label || __( 'Icon', 'bcew-blocks' );
};

/**
 * Wrapper `div` props: decorative `aria-hidden`, or informative `role` + `aria-label`.
 *
 * @param {Object}  attributes                Block attributes.
 * @param {string}  attributes.iconId         Selected icon id from the allowlist.
 * @param {boolean} attributes.isDecorative   Decorative mode flag from attributes.
 * @param {string}  attributes.accessibleName Optional custom accessible name.
 * @param {Object}  options                   Rendering context options.
 * @param {boolean} [options.forSave=false]   Use string `"true"` for `aria-hidden` in serialized HTML.
 * @return {Record<string, string|boolean>} Wrapper ARIA props for current icon mode.
 */
export const getIconWrapperA11yProps = (
    attributes,
    { forSave = false } = {}
) => {
    const { iconId, isDecorative, accessibleName } = attributes;
    const selectedIcon = ICON_ALLOWLIST_MAP[ iconId ];
    const decorative = isDecorativeMode( isDecorative );

    if ( decorative ) {
        return { 'aria-hidden': forSave ? 'true' : true };
    }
    if ( selectedIcon ) {
        return {
            role: 'img',
            'aria-label': getInformativeLabel( { accessibleName, iconId } ),
        };
    }
    return {};
};

/**
 * Props for the FA `<i>` so the glyph is not announced separately from the wrapper.
 *
 * @param {Object}  attributes              Block attributes (`iconId`, `isDecorative`).
 * @param {Object}  options                 Rendering context options.
 * @param {boolean} [options.forSave=false] Use string `"true"` in saved markup.
 * @return {Record<string, string|boolean>} Glyph-level ARIA props, if needed.
 */
export const getIconGlyphA11yProps = (
    attributes,
    { forSave = false } = {}
) => {
    const { iconId, isDecorative } = attributes;
    if ( ! ICON_ALLOWLIST_MAP[ iconId ] ) {
        return {};
    }
    if ( isDecorativeMode( isDecorative ) ) {
        return {};
    }
    return { 'aria-hidden': forSave ? 'true' : true };
};
