/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Placeholder for the site header.
 *
 * @return {import('react').ReactElement} Editor element.
 */
const Edit = () => <header { ...useBlockProps() } />;

export default Edit;
