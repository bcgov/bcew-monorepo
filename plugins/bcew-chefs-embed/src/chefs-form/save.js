import { useBlockProps } from '@wordpress/block-editor';

/**
 * Static markup for the CHEFS Form block.
 *
 * Stores only the Form ID and confirmation message override. view.js creates
 * the CHEFS viewer from this markup on the published page. While block.json
 * still registers render.php, the server render replaces this markup.
 *
 * @param {Object} props            Block props.
 * @param {Object} props.attributes Block attributes.
 * @return {Element} Saved block markup.
 */
const save = ( { attributes } ) => {
    const formId = ( attributes.formId || '' ).trim();
    const confirmationMessage = ( attributes.confirmationMessage || '' ).trim();

    const blockProps = useBlockProps.save( {
        className: 'bcew-chefs-form',
        'data-form-id': formId || undefined,
        'data-confirmation': confirmationMessage || undefined,
    } );

    return (
        <div { ...blockProps }>
            { formId && (
                <div className="bcew-chefs-form__mount" aria-live="polite" />
            ) }
        </div>
    );
};

export default save;
