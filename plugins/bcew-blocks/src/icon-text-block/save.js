/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @param {Object} props            Save props.
 * @param {Object} props.attributes Persisted block attributes.
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {import('react').ReactElement} Element to render.
 */
const save = ( { attributes = {} } = {} ) => {
    const { layout } = attributes;
    const supportedLayouts = [ 'icon-left', 'icon-top' ];
    const normalizedLayout = supportedLayouts.includes( layout )
        ? layout
        : 'icon-left';
    const layoutClass = `is-layout-${ normalizedLayout }`;

    const blockProps = useBlockProps.save( {
        className: `bcgov-wp-blocks-icon-text-block ${ layoutClass }`,
    } );

    return (
        <div { ...blockProps }>
            <div className="bcgov-wp-blocks-icon-text-block__layout-shell">
                <InnerBlocks.Content />
            </div>
        </div>
    );
};

export default save;
