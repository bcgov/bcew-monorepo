/* global customElements */

import { CHEFS_EMBED_INTEGRITY, CHEFS_EMBED_VERSION } from './constants';

const pendingScripts = new Map();

/**
 * Inject the viewer script with the pinned Subresource Integrity hash.
 *
 * @param {string} src Viewer script URL.
 * @return {Promise<void>}
 */
const injectViewerScript = ( src ) =>
    new Promise( ( resolve, reject ) => {
        const finish = () => {
            if ( customElements.get( 'chefs-form-viewer' ) ) {
                resolve();
                return;
            }

            reject(
                new Error(
                    'CHEFS form viewer script loaded but custom element is missing.'
                )
            );
        };
        const script = document.createElement( 'script' );
        script.src = src;
        script.integrity = CHEFS_EMBED_INTEGRITY;
        script.crossOrigin = 'anonymous';
        script.async = true;
        script.onload = finish;
        // Also fires when the browser blocks the script for an SRI mismatch.
        // Remove the failed tag so a later retry injects a fresh one instead
        // of waiting on an error event that has already fired.
        script.onerror = () => {
            script.remove();
            reject( new Error( 'Unable to load the CHEFS form viewer.' ) );
        };
        document.head.appendChild( script );
    } );

/**
 * Load the CHEFS form viewer web component script once per base URL.
 *
 * @param {string} baseUrl CHEFS app base URL (e.g. https://submit.digital.gov.bc.ca/app).
 * @return {Promise<void>}
 */
const ensureChefsFormViewerDefined = ( baseUrl ) => {
    if ( customElements.get( 'chefs-form-viewer' ) ) {
        return Promise.resolve();
    }

    const root = String( baseUrl || '' ).replace( /\/$/, '' );
    if ( ! root ) {
        return Promise.reject(
            new Error( 'Missing CHEFS base URL for form viewer script.' )
        );
    }

    const src = `${ root }/embed/${ CHEFS_EMBED_VERSION }/embed/chefs-form-viewer.min.js`;

    if ( pendingScripts.has( src ) ) {
        return pendingScripts.get( src );
    }

    const pending = injectViewerScript( src );
    pendingScripts.set( src, pending );
    return pending.finally( () => {
        pendingScripts.delete( src );
    } );
};

export default ensureChefsFormViewerDefined;
