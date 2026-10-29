import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
    Notice,
    PanelBody,
    TextControl,
    TextareaControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

import ChefsFormPreview from './components/chefs-form-preview';
import normalizeFormId from './utils/normalize-form-id';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Persisted attributes.
 * @param {Function} props.setAttributes Updates block attributes.
 * @return {Element} Element to render.
 */
const Edit = ( { attributes, setAttributes } ) => {
    const { formId = '', confirmationMessage = '' } = attributes;
    const [ formIdInput, setFormIdInput ] = useState( formId );
    const [ isFormIdFocused, setIsFormIdFocused ] = useState( false );
    const [ invalidFormId, setInvalidFormId ] = useState( false );

    useEffect( () => {
        if ( ! isFormIdFocused && ! invalidFormId ) {
            setFormIdInput( formId );
        }
    }, [ formId, invalidFormId, isFormIdFocused ] );

    const updateFormId = ( value ) => {
        const normalizedFormId = normalizeFormId( value );

        setFormIdInput( value );
        setAttributes( { formId: normalizedFormId } );
        setInvalidFormId( !! value.trim() && ! normalizedFormId );
    };

    return (
        <>
            <InspectorControls>
                <PanelBody
                    title={ __( 'CHEFS Form', 'bcew-chefs-embed' ) }
                    initialOpen
                >
                    <TextControl
                        label={ __(
                            'Form ID or share URL',
                            'bcew-chefs-embed'
                        ) }
                        help={ __(
                            'Enter a CHEFS Form ID or share URL. The Form ID is saved.',
                            'bcew-chefs-embed'
                        ) }
                        value={ formIdInput }
                        onFocus={ () => setIsFormIdFocused( true ) }
                        onBlur={ () => setIsFormIdFocused( false ) }
                        onChange={ updateFormId }
                        __nextHasNoMarginBottom
                    />

                    { invalidFormId && (
                        <Notice status="error" isDismissible={ false }>
                            <p>
                                { __(
                                    'Enter a valid CHEFS Form ID or share URL.',
                                    'bcew-chefs-embed'
                                ) }
                            </p>
                        </Notice>
                    ) }

                    <TextareaControl
                        label={ __(
                            'Confirmation message',
                            'bcew-chefs-embed'
                        ) }
                        help={ __(
                            'Plain text shown after a successful submission.',
                            'bcew-chefs-embed'
                        ) }
                        value={ confirmationMessage }
                        onChange={ ( value ) =>
                            setAttributes( { confirmationMessage: value } )
                        }
                        __nextHasNoMarginBottom
                    />
                </PanelBody>
            </InspectorControls>
            <div { ...useBlockProps() }>
                <ChefsFormPreview formId={ formId } />
            </div>
        </>
    );
};

export default Edit;
