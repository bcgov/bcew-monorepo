import { useBlockProps } from '@wordpress/block-editor';
import { CHEFS_BASE_URL } from './utils/constants';

/**
 * Static markup for the CHEFS Form block.
 *
 * Saves the tokenless CHEFS viewer web component with the Form ID and base URL,
 * plus the confirmation message override.
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
                // view.js replaces this live region with the success message after submission.
                <div className="bcew-chefs-form__mount" aria-live="polite">
                    <chefs-form-viewer
                        form-id={ formId }
                        base-url={ CHEFS_BASE_URL }
                        auto-reload-on-submit="false"
                    />
                </div>
            ) }
        </div>
    );
};

export default save;
