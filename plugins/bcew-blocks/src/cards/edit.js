/**
 * WordPress dependencies
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [ 'bcew-blocks/card' ];
const TEMPLATE = [ [ 'bcew-blocks/card' ] ];

/**
 * @return {import('react').ReactElement} Editor element.
 */
const Edit = () => {
    const blockProps = useBlockProps( { className: 'bcew-blocks-cards' } );
    const innerBlocksProps = useInnerBlocksProps( blockProps, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: TEMPLATE,
        orientation: 'horizontal',
    } );

    return <div { ...innerBlocksProps } />;
};

export default Edit;
