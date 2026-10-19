const pendingScripts = new Map();

/**
 * Load the CHEFS form viewer web component script once per base URL.
 *
 * @param {string} baseUrl CHEFS app base URL from embed-config (e.g. https://submit.digital.gov.bc.ca/app).
 * @return {Promise<void>}
 */
const ensureChefsFormViewerDefined = ( baseUrl ) => {
    if ( customElements.get( 'chefs-form-viewer' ) ) {
        return Promise.resolve();
    }

    const normalizedBaseUrl = String( baseUrl || '' ).replace( /\/$/, '' );
    if ( ! normalizedBaseUrl ) {
        return Promise.reject(
            new Error( 'Missing CHEFS base URL for form viewer script.' )
        );
    }

    const src = `${ normalizedBaseUrl }/embed/chefs-form-viewer.min.js`;

    if ( pendingScripts.has( src ) ) {
        return pendingScripts.get( src );
    }

    const pending = new Promise( ( resolve, reject ) => {
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

        const existing = document.querySelector( `script[src="${ src }"]` );
        if ( existing ) {
            if ( customElements.get( 'chefs-form-viewer' ) ) {
                resolve();
                return;
            }

            existing.addEventListener( 'load', finish, { once: true } );
            existing.addEventListener(
                'error',
                () =>
                    reject(
                        new Error( 'Unable to load the CHEFS form viewer.' )
                    ),
                { once: true }
            );
            return;
        }

        const script = document.createElement( 'script' );
        script.src = src;
        script.async = true;
        script.onload = finish;
        script.onerror = () =>
            reject( new Error( 'Unable to load the CHEFS form viewer.' ) );
        document.head.appendChild( script );
    } );

    pendingScripts.set( src, pending );
    return pending.finally( () => {
        pendingScripts.delete( src );
    } );
};

export default ensureChefsFormViewerDefined;
