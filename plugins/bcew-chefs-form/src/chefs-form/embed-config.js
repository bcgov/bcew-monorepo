/**
 * Build the embed-config REST URL for a form.
 *
 * Prefers the localized rest_url() value so plain permalinks
 * (`index.php?rest_route=...`) work in local wp-env.
 *
 * @param {string} formId CHEFS form UUID.
 * @return {string}
 */
export function getEmbedConfigUrl( formId ) {
	const base =
		window.bcewChefsFormSettings?.embedConfigUrl ||
		'/wp-json/bcew-chefs/v1/embed-config';
	const url = new URL( base, window.location.origin );
	url.searchParams.set( 'form_id', formId );
	return url.toString();
}
