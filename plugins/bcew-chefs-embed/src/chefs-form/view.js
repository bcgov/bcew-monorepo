/**
 * Frontend loader for CHEFS Form blocks on published pages.
 *
 * Reads data-form-id from the server-rendered markup, calls embed-config for a
 * short-lived token, then mounts the CHEFS web component (editable — not read-only).
 * On successful submit, replaces the viewer with a static success message
 * (DSWP-1149 generic, DSWP-1150 custom confirmation).
 * On CHEFS submit/load HTTP errors, shows title, status, and detail above
 * the form (DSWP-1151) and leaves the form on the page.
 */
import ensureChefsFormViewerDefined from './utils/ensure-chefs-form-viewer';

/**
 * Resolve the WordPress REST API root URL.
 *
 * @return {string} Trailing-slash REST root.
 */
const getRestRoot = () => {
    /*
     * WordPress prints a discovery link with the REST API root. Prefer that
     * so the plugin still works when the site lives in a subdirectory.
     * If the tag is missing, assume /wp-json/ on this origin.
     */
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

    /*
     * A failed status or a body without token and base URL means the form
     * cannot load. Throw so mountChefsForm can show the load-error message.
     */
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
 * Used when the form never loaded (embed-config or script failure). There is
 * no form to keep on the page, so the mount is replaced.
 *
 * @param {HTMLElement} mount   Mount element.
 * @param {string}      message Error text.
 */
const showError = ( mount, message ) => {
    /*
     * The form never appeared, so empty the mount and show one alert.
     * This is not the CHEFS submit-error banner; that path keeps the form.
     */
    mount.replaceChildren();
    mount.removeAttribute( 'aria-busy' );

    const error = document.createElement( 'p' );
    error.className = 'bcew-chefs-form__error';
    error.setAttribute( 'role', 'alert' );
    error.textContent = message;
    mount.appendChild( error );
};

/*
 * Only strings, numbers, and booleans become visible text. String(null)
 * would show "null", and a leftover object would show "[object Object]".
 * Those must not appear on the page.
 */
const asPlainText = ( value ) => {
    if ( 'number' === typeof value || 'boolean' === typeof value ) {
        return String( value );
    }

    if ( 'string' === typeof value ) {
        return value.trim();
    }

    return '';
};

/**
 * Read title, status, and detail from a formio:error payload.
 *
 * @param {unknown} payload Event detail from formio:error.
 * @return {{title: string, status: string, detail: string}} Error fields.
 */
const readChefsError = ( payload ) => {
    /*
     * CHEFS errors use title, status, and detail. The web component may send
     * that object, wrap it as { error: { title, status, detail } }, or — most
     * often — only { error: "detail string" } after it has already pulled
     * json.detail. Map all three onto the same three fields. Prefer detail,
     * then message, then a string error field.
     */
    if ( ! payload || 'object' !== typeof payload ) {
        return { title: '', status: '', detail: asPlainText( payload ) };
    }

    if (
        payload.error &&
        'object' === typeof payload.error &&
        ! Array.isArray( payload.error )
    ) {
        return {
            title: asPlainText( payload.error.title ),
            status: asPlainText( payload.error.status ),
            detail:
                asPlainText( payload.error.detail ) ||
                asPlainText( payload.error.message ),
        };
    }

    return {
        title: asPlainText( payload.title ),
        status: asPlainText( payload.status ),
        detail:
            asPlainText( payload.detail ) ||
            asPlainText( payload.message ) ||
            ( 'string' === typeof payload.error
                ? asPlainText( payload.error )
                : '' ),
    };
};

/**
 * Remove a previous CHEFS error banner (direct child of the block root).
 *
 * @param {HTMLElement} root Block wrapper.
 */
const clearChefsError = ( root ) => {
    /*
     * Only remove banners that are direct children of this block. A second
     * form on the page keeps its own message. A load-error paragraph inside
     * the mount is also left alone.
     */
    root.querySelectorAll( ':scope > .bcew-chefs-form__error' ).forEach(
        ( node ) => {
            node.remove();
        }
    );
};

/**
 * Show a CHEFS error message above the form (DSWP-1151).
 *
 * Heading is "{title} - {status}". Body is detail. The form stays visible.
 *
 * @param {HTMLElement} root  Block wrapper.
 * @param {Object}      error Error fields (title, status, detail).
 */
const showChefsError = ( root, error ) => {
    /*
     * Skip an empty payload so we do not insert a blank alert. Heading is
     * "title - status" when those fields exist. Place the banner above the
     * form so the visitor can read it and try again.
     */
    if ( ! error.title && ! error.status && ! error.detail ) {
        return;
    }

    clearChefsError( root );

    const region = document.createElement( 'div' );
    region.className = 'bcew-chefs-form__error';
    region.setAttribute( 'role', 'alert' );

    const headingText = [ error.title, error.status ]
        .filter( Boolean )
        .join( ' - ' );

    if ( headingText ) {
        const heading = document.createElement( 'h2' );
        heading.textContent = headingText;
        region.append( heading );
    }

    if ( error.detail ) {
        const message = document.createElement( 'p' );
        message.textContent = error.detail;
        region.append( message );
    }

    const mount = root.querySelector( '.bcew-chefs-form__mount' );

    if ( mount ) {
        mount.before( region );
    } else {
        root.prepend( region );
    }
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
    /*
     * Success replaces the form. Clear any CHEFS error banner first.
     * Heading is always "Success". The paragraph is the custom confirmation
     * from Settings, or the generic sentence when none is saved.
     */
    if ( mount.parentElement ) {
        clearChefsError( mount.parentElement );
    }

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
        /*
         * Fetch a short-lived token and any custom confirmation, then create
         * the CHEFS web component. We draw success and error ourselves, so
         * turn off CHEFS auto-reload after submit.
         */
        const config = await fetchEmbedConfig( formId );
        await ensureChefsFormViewerDefined( config.baseUrl );

        const viewer = document.createElement( 'chefs-form-viewer' );
        viewer.setAttribute( 'form-id', formId );
        viewer.setAttribute( 'auth-token', config.token );
        viewer.setAttribute( 'base-url', config.baseUrl );
        viewer.setAttribute( 'auto-reload-on-submit', 'false' );

        /*
         * Submit success and CHEFS HTTP errors are separate events. Success
         * replaces the form. A CHEFS error is shown above it and the form stays.
         */
        viewer.addEventListener( 'formio:submitDone', () => {
            showSuccess( mount, config.confirmation );
        } );

        viewer.addEventListener( 'formio:error', ( event ) => {
            showChefsError( root, readChefsError( event?.detail ) );
        } );

        mount.replaceChildren( viewer );
        mount.removeAttribute( 'aria-busy' );

        if ( 'function' === typeof viewer.load ) {
            await viewer.load();
        }
    } catch ( error ) {
        /*
         * Embed-config or the viewer script failed. There is no form to keep,
         * so replace the mount with a single error paragraph.
         */
        showError( mount, error?.message || 'Unable to load the CHEFS form.' );
    }
};

/*
 * Each CHEFS Form block on the published page is mounted on its own. The
 * two selectors cover the class WordPress adds on the wrapper and our own
 * class on the same element.
 */
const roots = document.querySelectorAll(
    '.wp-block-bcew-chefs-embed-chefs-form[data-form-id], .bcew-chefs-form[data-form-id]'
);

roots.forEach( ( root ) => {
    mountChefsForm( root );
} );
