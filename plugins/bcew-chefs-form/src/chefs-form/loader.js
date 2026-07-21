export async function loadViewer( container, config ) {
	const { formId, authToken, baseUrl, viewerScriptUrl } = config;

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

	viewer.addEventListener( 'formio:error', ( event ) => {
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
