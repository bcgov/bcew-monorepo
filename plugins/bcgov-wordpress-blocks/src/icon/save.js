/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import {
    getIconGlyphA11yProps,
    getIconWrapperA11yProps,
} from './icon-accessibility';
import { ICON_ALLOWLIST_MAP } from './icon-allowlist';
import { getIconWrapperClasses } from './icon-classes';

/**
 * Static markup for the Icon block (serialized in post content).
 * FA glyph uses `<i>`; placeholder uses `<span>` with visible text.
 *
 * @param {Object} props            Block props.
 * @param {Object} props.attributes Persisted attributes.
 * @return {import('react').ReactElement} Saved output.
 */
const save = ( { attributes } ) => {
    const { iconId, iconSize } = attributes;
    const selectedIcon = ICON_ALLOWLIST_MAP[ iconId ];

    const blockProps = useBlockProps.save( {
        className: getIconWrapperClasses( { iconSize } ),
        ...getIconWrapperA11yProps( attributes, { forSave: true } ),
    } );

    const iconNode = selectedIcon ? (
        <i
            className={ `bcgov-wp-blocks-icon__preview ${ selectedIcon.faClass }` }
            { ...getIconGlyphA11yProps( attributes, { forSave: true } ) }
        />
    ) : (
        <span className="bcgov-wp-blocks-icon__preview">
            <i
                className="bcgov-wp-blocks-icon__placeholder-icon fa-regular fa-image"
                aria-hidden
            />
            <span className="bcgov-wp-blocks-icon__placeholder-text">
                { __( 'Select icon', 'bcew-blocks' ) }
            </span>
        </span>
    );

    return <div { ...blockProps }>{ iconNode }</div>;
};

export default save;
