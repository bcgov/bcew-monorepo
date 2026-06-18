/**
 * WordPress dependencies
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

/**
 * @return {import('react').ReactElement} Element to render.
 */
const save = () => {
    const blockProps = useBlockProps.save( { className: 'bcew-blocks-cards' } );

    return (
        <div { ...blockProps }>
            <InnerBlocks.Content />
        </div>
    );
};

export default save;
