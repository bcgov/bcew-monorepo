import { CHEFS_VIEWER_SCRIPT_PATH, getChefsEmbedUrls } from './constants';

const pendingScripts = new Map();

const SRI_HASH_PATTERN = /^sha(256|384|512)-[A-Za-z0-9+/]+={0,2}$/;

/**
 * Read the viewer script's SRI hash from the versioned CHEFS integrity manifest.
 *
 * @param {string} manifestUrl Integrity manifest URL.
 * @return {Promise<string>} SRI hash, e.g. "sha384-...".
 */
const fetchViewerIntegrity = async ( manifestUrl ) => {
    const response = await fetch( manifestUrl, {
        credentials: 'omit',
        cache: 'no-cache',
    } );

    if ( ! response.ok ) {
        throw new Error(
            `Unable to load the CHEFS integrity manifest (${ response.status }).`
        );
    }

    const manifest = await response.json();
    const integrity = manifest?.[ CHEFS_VIEWER_SCRIPT_PATH ];

    if (
        'string' !== typeof integrity ||
        ! SRI_HASH_PATTERN.test( integrity )
    ) {
        throw new Error(
            'CHEFS integrity manifest has no valid hash for the form viewer.'
        );
    }

    return integrity;
};

/**
 * Inject the viewer script with Subresource Integrity.
 *
 * @param {string} src       Viewer script URL.
 * @param {string} integrity SRI hash for the script.
 * @return {Promise<void>}
 */
const injectViewerScript = ( src, integrity ) =>
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
        const fail = () =>
            reject( new Error( 'Unable to load the CHEFS form viewer.' ) );

        const existing = document.querySelector( `script[src="${ src }"]` );
        if ( existing ) {
            if ( customElements.get( 'chefs-form-viewer' ) ) {
                resolve();
                return;
            }

            existing.addEventListener( 'load', finish, { once: true } );
            existing.addEventListener( 'error', fail, { once: true } );
            return;
        }

        const script = document.createElement( 'script' );
        script.src = src;
        script.integrity = integrity;
        script.crossOrigin = 'anonymous';
        script.async = true;
        script.onload = finish;
        // Also fires when the browser blocks the script for an SRI mismatch.
        script.onerror = fail;
        document.head.appendChild( script );
    } );

/**
 * Load the CHEFS form viewer web component script once per base URL.
 *
 * The script is only injected after its hash has been read from the versioned
 * CHEFS integrity manifest, so any manifest failure prevents it from loading.
 *
 * @param {string} baseUrl CHEFS app base URL (e.g. https://submit.digital.gov.bc.ca/app).
 * @return {Promise<void>}
 */
const ensureChefsFormViewerDefined = ( baseUrl ) => {
    if ( customElements.get( 'chefs-form-viewer' ) ) {
        return Promise.resolve();
    }

    if ( ! String( baseUrl || '' ).replace( /\/$/, '' ) ) {
        return Promise.reject(
            new Error( 'Missing CHEFS base URL for form viewer script.' )
        );
    }

    const { viewerScriptUrl, integrityManifestUrl } =
        getChefsEmbedUrls( baseUrl );

    if ( pendingScripts.has( viewerScriptUrl ) ) {
        return pendingScripts.get( viewerScriptUrl );
    }

    const pending = fetchViewerIntegrity( integrityManifestUrl ).then(
        ( integrity ) => injectViewerScript( viewerScriptUrl, integrity )
    );

    pendingScripts.set( viewerScriptUrl, pending );
    return pending.finally( () => {
        pendingScripts.delete( viewerScriptUrl );
    } );
};

export default ensureChefsFormViewerDefined;
