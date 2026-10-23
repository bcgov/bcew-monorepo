/**
 * WordPress dependencies
 */
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

/**
 * Saves the header and the blocks inside it.
 *
 * @return {import('react').ReactElement} Saved element.
 */
const save = () => (
    <header { ...useBlockProps.save() }>
        <InnerBlocks.Content />
    </header>
);

export default save;
