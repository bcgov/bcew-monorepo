import { loadViewer } from './loader';

function showMessage( container, className, message ) {
	const node = document.createElement( 'p' );
	node.className = className;
	node.textContent = message;
	container.replaceChildren( node );
}

document.querySelectorAll( '[data-bcew-chefs-embed]' ).forEach( ( container ) => {
	const embedRef = container.getAttribute( 'data-bcew-chefs-embed' );
	if ( ! embedRef ) {
		return;
	}

	fetch( `/wp-json/bcew-chefs/v1/embed-config?embed_ref=${ encodeURIComponent( embedRef ) }` )
		.then( ( response ) => response.json() )
		.then( async ( config ) => {
			if ( ! config.success ) {
				showMessage(
					container,
					'bcew-chefs-form__error',
					config.error || 'Could not load the CHEFS form.'
				);
				return;
			}

			await loadViewer( container, config, () => {
				const notice = document.createElement( 'p' );
				notice.className = 'bcew-chefs-form__success';
				notice.textContent = 'Thank you — your form has been submitted.';
				container.parentElement?.insertBefore( notice, container );
			} );
		} )
		.catch( () => {
			showMessage( container, 'bcew-chefs-form__error', 'Could not load the CHEFS form.' );
		} );
} );
