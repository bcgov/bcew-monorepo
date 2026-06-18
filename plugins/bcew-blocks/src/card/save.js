/**
 * WordPress dependencies
 */
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

/**
 * @return {import('react').ReactElement} Element to render.
 */
const save = () => {
    const blockProps = useBlockProps.save( { className: 'bcew-blocks-card' } );

    return (
        <div { ...blockProps }>
            <div className="bcew-blocks-card__content">
                <InnerBlocks.Content />
            </div>
        </div>
    );
};

export default save;
