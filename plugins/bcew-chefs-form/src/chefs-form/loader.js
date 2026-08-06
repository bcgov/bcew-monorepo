export async function loadViewer( container, config, onSubmitDone ) {
	const { formId, authToken, baseUrl } = config;
	const viewerScriptUrl = `${ baseUrl.replace( /\/$/, '' ) }/embed/chefs-form-viewer.js`;

	if ( ! customElements.get( 'chefs-form-viewer' ) ) {
		await new Promise( ( resolve, reject ) => {
			const script = document.createElement( 'script' );
			script.src = viewerScriptUrl;
			script.async = true;
			script.onload = () => resolve();
			script.onerror = () => reject();
			document.head.appendChild( script );
		} );
	}

	const viewer = document.createElement( 'chefs-form-viewer' );
	viewer.setAttribute( 'form-id', formId );
	viewer.setAttribute( 'auth-token', authToken );
	viewer.setAttribute( 'base-url', baseUrl );
	viewer.setAttribute( 'isolate-styles', 'true' );
	viewer.setAttribute( 'auto-reload-on-submit', 'false' );

	const resetSubmitting = () => {
		const form = viewer.formioInstance;
		if ( form ) {
			form.submitting = false;
			form.redraw?.();
		}
	};

	viewer.addEventListener( 'formio:submitDone', () => {
		resetSubmitting();
		onSubmitDone?.();
	} );

	viewer.addEventListener( 'formio:error', ( event ) => {
		resetSubmitting();
		const message = event?.detail?.error;
		if ( typeof message === 'string' && message ) {
			const error = document.createElement( 'p' );
			error.className = 'bcew-chefs-form__error';
			error.textContent = message;
			container.parentElement?.insertBefore( error, container );
		}
	} );

	container.replaceChildren( viewer );
	await viewer.load();
}
