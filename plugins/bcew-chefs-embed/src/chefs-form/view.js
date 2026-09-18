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
 * Normalize a CHEFS error payload from the fetch, the viewer, or a rejected load.
 *
 * Supports fetch Errors, direct viewer payloads, and wrapped shapes like
 * { error: { detail, status, ... } }.
 *
 * @param {unknown} payload Error payload.
 * @return {{title: string, status: string, detail: string}} Error fields.
 */
const normalizeChefsError = ( payload ) => {
    const raw =
        payload &&
        'object' === typeof payload &&
        payload.error &&
        'object' === typeof payload.error &&
        ! Array.isArray( payload.error )
            ? payload.error
            : payload;

    let response = {};

    if ( raw?.response && 'object' === typeof raw.response ) {
        response = raw.response;
    } else if ( payload?.response && 'object' === typeof payload.response ) {
        response = payload.response;
    }

    const status = asPlainText(
        response.status ?? raw?.status ?? payload?.status ?? 500
    );

    let resolvedStatusText = 'Request failed';

    if ( status && Number.isFinite( Number( status ) ) ) {
        if ( status >= 400 && status < 500 ) {
            resolvedStatusText = 'Bad Request';
        }
    }

    const statusText = asPlainText(
        response.statusText ??
            raw?.statusText ??
            payload?.statusText ??
            resolvedStatusText
    );

    const detail =
        asPlainText(
            response?.data?.message ??
                raw?.message ??
                payload?.message ??
                response?.data?.detail ??
                raw?.detail ??
                payload?.detail ??
                ( 'string' === typeof raw?.error ? raw.error : '' )
        ) || 'Unable to load the CHEFS form.';

    return {
        title: asPlainText( raw?.title ?? payload?.title ?? statusText ),
        status,
        detail,
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
    const normalized = normalizeChefsError( error );

    if ( ! normalized.title && ! normalized.status && ! normalized.detail ) {
        return;
    }

    clearChefsError( root );

    const region = document.createElement( 'div' );
    region.className = 'bcew-chefs-form__error';
    region.setAttribute( 'role', 'alert' );

    const headingText = [ normalized.title, normalized.status ]
        .filter( Boolean )
        .join( ' - ' );

    if ( headingText ) {
        const heading = document.createElement( 'h2' );
        heading.textContent = headingText;
        region.append( heading );
    }

    if ( normalized.detail ) {
        const message = document.createElement( 'p' );
        message.textContent = normalized.detail;
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
    const viewer = root.querySelector( 'chefs-form-viewer' );
    const baseUrl = viewer?.getAttribute( 'base-url' ) || '';

    try {
        await ensureChefsFormViewerDefined( baseUrl );

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


        if ( 'function' === typeof viewer.load ) {
            await viewer.load();
        }
    } catch ( error ) {
        showChefsError( root, normalizeChefsError( error ) );
    }
};

/*
 * Each CHEFS Form block on the published page is mounted on its own. The
 * two selectors cover the class WordPress adds on the wrapper and our own
 * class on the same element.
 */
const roots = document.querySelectorAll(
    '.wp-block-bcew-chefs-embed-chefs-form, .bcew-chefs-form'
);

roots.forEach( ( root ) => {
    mountChefsForm( root );
} );
