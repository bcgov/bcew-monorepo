/**
 * WordPress dependencies
 */
import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

/**
 * @return {import('react').ReactElement} Editor element.
 */
const Edit = () => {
    const blockProps = useBlockProps( { className: 'bcew-blocks-card' } );
    const innerBlocksProps = useInnerBlocksProps( {
        className: 'bcew-blocks-card__content',
    } );

    return (
        <div { ...blockProps }>
            <div { ...innerBlocksProps } />
        </div>
    );
};

export default Edit;
