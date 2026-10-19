/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Placeholder for the site header.
 *
 * @return {import('react').ReactElement} Saved element.
 */
const save = () => <header { ...useBlockProps.save() } />;

export default save;
