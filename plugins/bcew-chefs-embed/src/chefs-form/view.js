/**
 * Frontend loader for CHEFS Form blocks on published pages.
 *
 * Reads data-form-id from the server-rendered markup, calls embed-config for a
 * short-lived token, then mounts the CHEFS web component (editable — not read-only).
 * On successful submit, replaces the viewer with a static success message
 * (DSWP-1149 generic, DSWP-1150 custom confirmation).
 * On load or submit failure, shows a clear public message (DSWP-1267) and keeps
 * technical CHEFS wording off the page.
 */
import ensureChefsFormViewerDefined from './utils/ensure-chefs-form-viewer';

/*
 * Visitor-facing copy for embed-config failures. Keys match the WP_Error
 * codes returned by EmbedConfigController. Unknown codes use the generic
 * "not available" message.
 */
const PUBLIC_LOAD_ERRORS = {
	chefs_form_not_configured:
		'This form is no longer set up on this website. Please contact the site administrator and ask them to reconnect it in CHEFS Forms.',
	chefs_form_not_found:
		'This form could not be found. Please contact the site administrator and ask them to check the Form ID in CHEFS (it may have been deleted).',
	chefs_api_key_invalid:
		'This form cannot load because its API key is invalid. Please contact the site administrator and ask them to update the API key in CHEFS Forms.',
	chefs_unavailable:
		'The form service is temporarily unavailable. Please try again in a few minutes. If this continues, contact the site administrator.',
	chefs_form_unavailable:
		'This form is not available to fill out right now. Please contact the site administrator and ask them to confirm it exists in CHEFS and is published.',
};

const PUBLIC_SUBMIT_ERROR =
	'Your form could not be submitted. Please review your answers and try again.';

/* ==== TEMP (DSWP-1267) START — DELETE THIS WHOLE BLOCK BEFORE MERGE ====
 * On a published page with WP_DEBUG, append ?chefs_debug_error=<code> to
 * preview public messages. Values match PUBLIC_LOAD_ERRORS keys, or "submit".
 */
const getDebugErrorCode = () => {
	try {
		return (
			new URLSearchParams( window.location.search ).get(
				'chefs_debug_error'
			) || ''
		);
	} catch ( error ) {
		return '';
	}
};
/* ==== TEMP (DSWP-1267) END ==== */

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
 * Map an embed-config error code to visitor-facing text.
 *
 * @param {string|undefined} code WP_Error code from embed-config.
 * @return {string} Public message.
 */
const messageForLoadError = ( code ) =>
	PUBLIC_LOAD_ERRORS[ code ] || PUBLIC_LOAD_ERRORS.chefs_form_unavailable;

/**
 * Fetch CHEFS embed configuration for a form ID.
 *
 * @param {string} formId CHEFS form ID.
 * @return {Promise<{token: string, baseUrl: string, confirmation?: string|null}>} Embed config payload.
 */
const fetchEmbedConfig = async ( formId ) => {
	const params = new URLSearchParams( {
		formId,
	} );

	/* ==== TEMP (DSWP-1267) START — DELETE THIS BLOCK BEFORE MERGE ==== */
	const debugError = getDebugErrorCode();
	if ( debugError && 'submit' !== debugError ) {
		params.set( 'forceError', debugError );
	}
	/* ==== TEMP (DSWP-1267) END ==== */

	const url = `${ getRestRoot() }bcew-chefs-embed/v1/embed-config?${ params.toString() }`;

	const response = await fetch( url, {
		method: 'GET',
		credentials: 'same-origin',
		headers: {
			Accept: 'application/json',
		},
	} );

	const payload = await response.json().catch( () => ( {} ) );

	/*
	 * Prefer the stable error code from WordPress so the page can show a
	 * clear message. Fall back to the generic unavailable copy when the
	 * response has no code.
	 */
	if ( ! response.ok ) {
		throw new Error( messageForLoadError( payload?.code ) );
	}

	if ( ! payload?.token || ! payload?.baseUrl ) {
		throw new Error( PUBLIC_LOAD_ERRORS.chefs_form_unavailable );
	}

	return payload;
};

/**
 * Show a load-error message inside the block mount point.
 *
 * Used when the form never loaded (embed-config or script failure). There is
 * no form to keep on the page, so the mount is replaced.
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
 * Show a clear submit-failure message above the form. The form stays visible.
 *
 * @param {HTMLElement} root Block wrapper.
 */
const showSubmitError = ( root ) => {
	clearChefsError( root );

	const region = document.createElement( 'div' );
	region.className = 'bcew-chefs-form__error';
	region.setAttribute( 'role', 'alert' );

	const message = document.createElement( 'p' );
	message.textContent = PUBLIC_SUBMIT_ERROR;
	region.append( message );

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
		viewer.endpoints = {
			formioJs: `${ config.baseUrl }/webcomponents/v1/assets/formio.js`,
		};

		/*
		 * Submit success and CHEFS errors are separate events. Success
		 * replaces the form. A submit error is shown above it and the form stays.
		 */
		viewer.addEventListener( 'formio:submitDone', () => {
			showSuccess( mount, config.confirmation );
		} );

		viewer.addEventListener( 'formio:error', () => {
			showSubmitError( root );
		} );

		mount.replaceChildren( viewer );
		mount.removeAttribute( 'aria-busy' );

		if ( 'function' === typeof viewer.load ) {
			await viewer.load();
		}

		/* ==== TEMP (DSWP-1267) START — DELETE THIS BLOCK BEFORE MERGE ==== */
		if ( 'submit' === getDebugErrorCode() ) {
			showSubmitError( root );
		}
		/* ==== TEMP (DSWP-1267) END ==== */
	} catch ( error ) {
		/*
		 * Embed-config or the viewer script failed. Prefer the friendly
		 * message thrown by fetchEmbedConfig. Script-load failures fall back
		 * to the generic unavailable copy.
		 */
		const known = Object.values( PUBLIC_LOAD_ERRORS );
		const text =
			error?.message && known.includes( error.message )
				? error.message
				: PUBLIC_LOAD_ERRORS.chefs_form_unavailable;
		showError( mount, text );
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
