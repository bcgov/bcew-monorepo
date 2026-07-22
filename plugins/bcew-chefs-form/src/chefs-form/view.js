import { loadViewer } from './loader';

function showMessage( container, className, message ) {
	const node = document.createElement( 'p' );
	node.className = className;
	node.textContent = message;
	container.replaceChildren( node );
}

document.querySelectorAll( '[data-bcew-chefs-form-id]' ).forEach( ( container ) => {
	const formId = container.getAttribute( 'data-bcew-chefs-form-id' );
	if ( ! formId ) {
		return;
	}

	fetch( `/wp-json/bcew-chefs/v1/embed-config?form_id=${ encodeURIComponent( formId ) }` )
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

			await loadViewer( container, config );
		} )
		.catch( () => {
			showMessage( container, 'bcew-chefs-form__error', 'Could not load the CHEFS form.' );
		} );
} );
