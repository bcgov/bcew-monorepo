/**
 * CHEFS app base URL used to load the form viewer web component.
 */
export const CHEFS_BASE_URL =
    'https://chefs-dev.apps.silver.devops.gov.bc.ca/pr-1966'; // TEMP: revert to https://submit.digital.gov.bc.ca/app before release

/**
 * Immutable CHEFS viewer release that supports anonymous Public forms.
 * Changing this also changes the integrity manifest used for SRI.
 */
export const CHEFS_EMBED_VERSION = '1.1.0';

/**
 * Viewer script path relative to the embed version root. It is also the key
 * that holds the script's hash in the version's integrity manifest.
 */
export const CHEFS_VIEWER_SCRIPT_PATH = 'embed/chefs-form-viewer.min.js';

/**
 * Build the versioned CHEFS embed asset URLs for a CHEFS base URL.
 *
 * @param {string} baseUrl CHEFS app base URL.
 * @return {{viewerScriptUrl: string, integrityManifestUrl: string}} Asset URLs.
 */
export const getChefsEmbedUrls = ( baseUrl ) => {
    const root = `${ String( baseUrl || '' ).replace(
        /\/$/,
        ''
    ) }/embed/${ CHEFS_EMBED_VERSION }`;

    return {
        viewerScriptUrl: `${ root }/${ CHEFS_VIEWER_SCRIPT_PATH }`,
        integrityManifestUrl: `${ root }/integrity.json`,
    };
};
