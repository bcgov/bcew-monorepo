/**
 * CHEFS app base URL used to load the form viewer web component.
 */
export const CHEFS_BASE_URL =
    'https://chefs-dev.apps.silver.devops.gov.bc.ca/pr-1966'; // TEMP: revert to https://submit.digital.gov.bc.ca/app before release

/**
 * Immutable CHEFS viewer release that supports anonymous Public forms.
 */
export const CHEFS_EMBED_VERSION = '1.1.0';

/**
 * Pinned SRI hash of `{CHEFS_BASE_URL}/embed/{CHEFS_EMBED_VERSION}/chefs-form-viewer.min.js`.
 * Recompute it whenever the base URL or version changes:
 *   curl -sSL <url> | openssl dgst -sha384 -binary | openssl base64 -A
 * Found at `{CHEFS_BASE_URL}/embed/{CHEFS_EMBED_VERSION}/integrity.json.
 * Verify curl -sL "{CHEFS_BASE_URL}/embed/{CHEFS_EMBED_VERSION/chefs-form-viewer.min.js" | openssl dgst -sha384 -binary | openssl base64 -A
 */
export const CHEFS_EMBED_INTEGRITY =
    'sha384-vlfl5pkyza8idP/Pe5maCWTBCa0+oVuWaeNaruCwF1zyyMPIW5mv7W+wZRZxRTKd';
