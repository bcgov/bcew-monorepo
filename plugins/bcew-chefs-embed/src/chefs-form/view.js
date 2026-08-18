/**
 * Frontend loader for CHEFS Form blocks on published pages.
 *
 * Reads data-form-id from the server-rendered markup, calls embed-config for a
 * short-lived token, then mounts the CHEFS web component (editable — not read-only).
 * On successful submit, replaces the viewer with a static success message
 * (DSWP-1149 generic, DSWP-1150 custom confirmation).
 */
import ensureChefsFormViewerDefined from './utils/ensure-chefs-form-viewer';

/**
 * Resolve the WordPress REST API root URL.
 *
 * @return {string} Trailing-slash REST root.
 */
const getRestRoot = () => {
    const discovery = document.querySelector(
        'link[rel="https://api.w.org/"]'
    )?.href;

    if ( discovery ) {
        return discovery.endsWith( '/' ) ? discovery : `${ discovery }/`;
    }

    return `${ window.location.origin }/wp-json/`;
};

/**
 * Fetch CHEFS embed configuration for a form ID.
 *
 * @param {string} formId CHEFS form ID.
 * @return {Promise<{token: string, baseUrl: string, confirmation?: string|null}>} Embed config payload.
 */
const fetchEmbedConfig = async ( formId ) => {
    const url = `${ getRestRoot() }bcew-chefs-embed/v1/embed-config?formId=${ encodeURIComponent(
        formId
    ) }`;

    const response = await fetch( url, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
        },
    } );

    const payload = await response.json().catch( () => ( {} ) );

    if ( ! response.ok ) {
        throw new Error(
            payload?.message || 'Unable to load the CHEFS form configuration.'
        );
    }

    if ( ! payload?.token || ! payload?.baseUrl ) {
        throw new Error( 'CHEFS returned an invalid embed configuration.' );
    }

    return payload;
};

/**
 * Show an error message inside the block mount point.
 *
 * @param {HTMLElement} mount   Mount element.
 * @param {string}      message Error text.
 */
const showError = ( mount, message ) => {
    mount.replaceChildren();
    mount.removeAttribute( 'aria-busy' );

    const error = document.createElement( 'p' );
    error.className = 'bcew-chefs-form__error';
    error.setAttribute( 'role', 'alert' );
    error.textContent = message;
    mount.appendChild( error );
};

/**
 * Default success copy when no custom confirmation is saved (DSWP-1149).
 */
const GENERIC_SUCCESS_MESSAGE = 'Your form has been submitted successfully';

/**
 * Show the post-submit success message (DSWP-1149, DSWP-1150).
 *
 * Uses the custom confirmation when one is saved for this form.
 * Otherwise shows the generic success text.
 *
 * Inline (not a modal): not dismissible; cleared when the page is refreshed.
 *
 * @param {HTMLElement} mount         Mount element.
 * @param {string|null} customMessage Custom confirmation from embed-config.
 */
const showSuccess = ( mount, customMessage ) => {
    mount.replaceChildren();
    mount.removeAttribute( 'aria-busy' );

    const region = document.createElement( 'div' );
    region.className = 'bcew-chefs-form__success';
    region.setAttribute( 'role', 'status' );

    const heading = document.createElement( 'h2' );
    heading.textContent = 'Success';

    const trimmed =
        'string' === typeof customMessage ? customMessage.trim() : '';

    const message = document.createElement( 'p' );
    message.textContent = trimmed || GENERIC_SUCCESS_MESSAGE;

    region.append( heading, message );
    mount.appendChild( region );
};

/**
 * Mount a CHEFS form viewer for one block root.
 *
 * @param {HTMLElement} root Block wrapper with data-form-id.
 * @return {Promise<void>}
 */
const mountChefsForm = async ( root ) => {
    const formId = root.dataset.formId?.trim() || '';
    const mount = root.querySelector( '.bcew-chefs-form__mount' );

    if ( ! formId || ! mount ) {
        return;
    }

    try {
        const config = await fetchEmbedConfig( formId );
        await ensureChefsFormViewerDefined( config.baseUrl );

        const viewer = document.createElement( 'chefs-form-viewer' );
        viewer.setAttribute( 'form-id', formId );
        viewer.setAttribute( 'auth-token', config.token );
        viewer.setAttribute( 'base-url', config.baseUrl );
        // Host shows its own success UI; skip CHEFS read-only auto-reload.
        viewer.setAttribute( 'auto-reload-on-submit', 'false' );

        viewer.addEventListener( 'formio:submitDone', () => {
            showSuccess( mount, config.confirmation );
        } );

        mount.replaceChildren( viewer );
        mount.removeAttribute( 'aria-busy' );

        if ( 'function' === typeof viewer.load ) {
            await viewer.load();
        }
    } catch ( error ) {
        showError( mount, error?.message || 'Unable to load the CHEFS form.' );
    }
};

const roots = document.querySelectorAll(
    '.wp-block-bcew-chefs-embed-chefs-form[data-form-id], .bcew-chefs-form[data-form-id]'
);

roots.forEach( ( root ) => {
    mountChefsForm( root );
} );
