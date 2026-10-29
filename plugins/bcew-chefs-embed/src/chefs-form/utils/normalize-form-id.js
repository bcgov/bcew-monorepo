const FORM_ID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Normalize a CHEFS Form ID or share URL to a lowercase Form ID.
 *
 * Share URLs carry the Form ID in the `f` query parameter, for example
 * https://submit.digital.gov.bc.ca/app/form/submit?f=<form-id>.
 *
 * @param {unknown} value Form ID or CHEFS share URL entered by an author.
 * @return {string} The Form ID, or an empty string when none can be found.
 */
const normalizeFormId = ( value ) => {
    const input = ( 'string' === typeof value ? value.trim() : '' ).toLowerCase();

    if ( FORM_ID_PATTERN.test( input ) ) {
        return input.toLowerCase();
    }

    let url;
    try {
        url = new URL( input );
    } catch {
        return '';
    }

    if ( 'https:' !== url.protocol && 'http:' !== url.protocol ) {
        return '';
    }

    const formId = ( url.searchParams.get( 'f' ) || '' ).trim();

    return FORM_ID_PATTERN.test( formId ) ? formId.toLowerCase() : '';
};

export default normalizeFormId;
