import apiFetch from '@wordpress/api-fetch';
import { Notice, Spinner } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import ensureChefsFormViewerDefined from '../utils/ensure-chefs-form-viewer';

/**
 * Editor preview for a selected CHEFS form.
 *
 * Fetches a short-lived token from embed-config, loads the CHEFS web component,
 * and renders it read-only so the form cannot be submitted in the editor.
 *
 * @param {Object} props        Component props.
 * @param {string} props.formId Selected CHEFS form ID.
 * @return {Element} Preview UI.
 */
const ChefsFormPreview = ( { formId } ) => {
    const viewerHostRef = useRef( null );
    const [ isLoading, setIsLoading ] = useState( false );
    const [ errorMessage, setErrorMessage ] = useState( '' );

    useEffect( () => {
        const host = viewerHostRef.current;

        if ( ! formId ) {
            setIsLoading( false );
            setErrorMessage( '' );
            if ( host ) {
                host.replaceChildren();
            }
            return undefined;
        }

        let isCancelled = false;

        const loadPreview = async () => {
            setIsLoading( true );
            setErrorMessage( '' );

            if ( host ) {
                host.replaceChildren();
            }

            try {
                const config = await apiFetch( {
                    path: `/bcew-chefs-embed/v1/embed-config?formId=${ encodeURIComponent(
                        formId
                    ) }`,
                } );

                if ( isCancelled ) {
                    return;
                }

                if ( ! config?.token || ! config?.baseUrl ) {
                    throw new Error(
                        __(
                            'CHEFS returned an invalid embed configuration.',
                            'bcew-chefs-embed'
                        )
                    );
                }

                await ensureChefsFormViewerDefined( config.baseUrl );

                if ( isCancelled || ! viewerHostRef.current ) {
                    return;
                }

                const viewer = document.createElement( 'chefs-form-viewer' );
                viewer.setAttribute( 'form-id', formId );
                viewer.setAttribute( 'auth-token', config.token );
                viewer.setAttribute( 'base-url', config.baseUrl );
                viewer.setAttribute( 'read-only', '' );

                viewerHostRef.current.replaceChildren( viewer );

                if ( 'function' === typeof viewer.load ) {
                    await viewer.load();
                }
            } catch ( error ) {
                if ( isCancelled ) {
                    return;
                }

                setErrorMessage(
                    error?.message ||
                        __(
                            'Unable to load the CHEFS form.',
                            'bcew-chefs-embed'
                        )
                );

                if ( viewerHostRef.current ) {
                    viewerHostRef.current.replaceChildren();
                }
            } finally {
                if ( ! isCancelled ) {
                    setIsLoading( false );
                }
            }
        };

        loadPreview();

        return () => {
            isCancelled = true;
        };
    }, [ formId ] );

    if ( ! formId ) {
        return (
            <p>
                { __(
                    'Select a CHEFS form in block settings.',
                    'bcew-chefs-embed'
                ) }
            </p>
        );
    }

    return (
        <div className="bcew-chefs-form-preview__container">
            { isLoading && <Spinner /> }

            { ! isLoading && !! errorMessage && (
                <Notice status="error" isDismissible={ false }>
                    <p>{ errorMessage }</p>
                </Notice>
            ) }

            <div ref={ viewerHostRef } />
        </div>
    );
};

export default ChefsFormPreview;
