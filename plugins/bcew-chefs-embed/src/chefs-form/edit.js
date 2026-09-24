import apiFetch from '@wordpress/api-fetch';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
    ExternalLink,
    Notice,
    PanelBody,
    SelectControl,
    Spinner,
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

/**
 * Transform API response into block-compatible form object.
 *
 * @param {Object}        form           API form object with form_id and form_name.
 * @param {string|number} form.form_id   API form identifier.
 * @param {string}        form.form_name API form name.
 * @return {Object} Transformed form with formId and formName.
 */
const transformForm = ( { form_id: formId, form_name: formName } ) => ( {
    formId,
    formName: formName || formId,
} );

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
    const { formId = '' } = attributes;
    const [ savedForms, setSavedForms ] = useState( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ fetchError, setFetchError ] = useState( '' );
    const settingsUrl = window.bcewChefsEmbedSettings?.settingsUrl || '';

    useEffect( () => {
        let isMounted = true;

        const loadSavedForms = async () => {
            setIsLoading( true );
            setFetchError( '' );

            try {
                const response = await apiFetch( {
                    path: '/bcew-chefs-embed/v1/forms',
                } );

                if ( ! isMounted ) {
                    return;
                }

                const forms = Array.isArray( response )
                    ? response
                          .map( transformForm )
                          .filter( ( form ) => form.formId )
                    : [];

                setSavedForms( forms );

                if (
                    formId &&
                    ! forms.some( ( form ) => form.formId === formId )
                ) {
                    setAttributes( { formId: '' } );
                }
            } catch ( error ) {
                if ( ! isMounted ) {
                    return;
                }

                setFetchError(
                    error?.message ||
                        __(
                            'Unable to load saved CHEFS forms.',
                            'bcew-chefs-embed'
                        )
                );
                setSavedForms( [] );
            } finally {
                if ( isMounted ) {
                    setIsLoading( false );
                }
            }
        };

        loadSavedForms();

        return () => {
            isMounted = false;
        };
    }, [ formId, setAttributes ] );

    const options = [
        {
            label: __( 'Select a form…', 'bcew-chefs-embed' ),
            value: '',
        },
        ...savedForms.map( ( form ) => ( {
            label: form.formName,
            value: form.formId,
        } ) ),
    ];

    return (
        <>
            <InspectorControls>
                <PanelBody
                    title={ __( 'CHEFS Form', 'bcew-chefs-embed' ) }
                    initialOpen
                >
                    { isLoading && <Spinner /> }

                    { ! isLoading && !! fetchError && (
                        <Notice status="error" isDismissible={ false }>
                            <p>{ fetchError }</p>
                        </Notice>
                    ) }

                    { ! isLoading && ! fetchError && savedForms.length > 0 && (
                        <SelectControl
                            label={ __( 'Form name', 'bcew-chefs-embed' ) }
                            help={ __(
                                'Choose one of the CHEFS forms saved in plugin settings.',
                                'bcew-chefs-embed'
                            ) }
                            value={ formId }
                            options={ options }
                            onChange={ ( value ) =>
                                setAttributes( { formId: value } )
                            }
                            __nextHasNoMarginBottom
                        />
                    ) }

                    { ! isLoading &&
                        ! fetchError &&
                        0 === savedForms.length && (
                            <Notice status="info" isDismissible={ false }>
                                <p>
                                    { __(
                                        'No CHEFS forms have been saved yet.',
                                        'bcew-chefs-embed'
                                    ) }
                                </p>
                                { settingsUrl && (
                                    <p>
                                        <ExternalLink href={ settingsUrl }>
                                            { __(
                                                'Open CHEFS settings',
                                                'bcew-chefs-embed'
                                            ) }
                                        </ExternalLink>
                                    </p>
                                ) }
                            </Notice>
                        ) }
                </PanelBody>
            </InspectorControls>
            <div { ...useBlockProps() }>
                <ChefsFormPreview formId={ formId } />
            </div>
        </>
    );
};

export default Edit;
