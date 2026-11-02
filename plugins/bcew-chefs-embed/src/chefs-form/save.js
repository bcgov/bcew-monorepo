import { useBlockProps } from '@wordpress/block-editor';

/**
 * Static markup for the CHEFS Form block.
 *
 * Saves the tokenless CHEFS viewer web component with the Form ID, plus the
 * confirmation message override. The base URL is not saved so it can change
 * without invalidating blocks; view.js sets it before loading the viewer.
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
                <div className="bcew-chefs-form__mount" aria-live="polite">
                    <chefs-form-viewer
                        form-id={ formId }
                        auto-reload-on-submit="false"
                    />
                </div>
            ) }
        </div>
    );
};

export default save;
