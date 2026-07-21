/**
 * CHEFS Form Controller — thank-you message (paste into CHEFS admin)
 *
 * Where: CHEFS → your form → Settings (⋮) → Form Controller
 * When: After a successful submission on the WordPress embed (or any embed)
 *
 * Works with auto-reload-on-submit (CHEFS default). The alert shows when
 * submit completes; the viewer then reloads read-only with submitted data.
 */
form.on( 'submitDone', function ( submission ) {
	form.setAlert(
		'success',
		'<strong>Thank you!</strong> Your submission has been received. ' +
			'Review your answers below, or email yourself a receipt if that option is enabled.'
	);
} );
