/**
 * Whether the block is in decorative mode (strict: only real boolean `true`).
 * Avoids truthy junk like the string `"false"` from breaking `aria-hidden` / labels.
 *
 * @param {unknown} value Raw `isDecorative` attribute.
 * @return {boolean} True only when explicitly decorative.
 */
export const isDecorativeMode = ( value ) => true === value;

/**
 * Shared class names for the Icon block wrapper (editor + saved markup).
 *
 * @param {Object} props          Block attributes.
 * @param {string} props.iconSize Size token: small | medium | large | xlarge.
 * @return {string} Space-separated class string merged into useBlockProps.
 */
export const getIconWrapperClasses = ( { iconSize } ) => {
    const size = [ 'small', 'medium', 'large', 'xlarge' ].includes( iconSize )
        ? iconSize
        : 'medium';

    return [
        'bcgov-wp-blocks-icon',
        `bcgov-wp-blocks-icon--size-${ size }`,
    ].join( ' ' );
};
