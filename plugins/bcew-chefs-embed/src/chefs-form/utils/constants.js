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
 * Pinned SRI hash of `{CHEFS_BASE_URL}/embed/{CHEFS_EMBED_VERSION}/embed/chefs-form-viewer.min.js`.
 * Recompute it whenever the base URL or version changes:
 *   curl -sSL <url> | openssl dgst -sha384 -binary | openssl base64 -A
 */
export const CHEFS_EMBED_INTEGRITY =
    'sha384-Zz9bmBPxz2kLWrUMwBzY3L8+jmwV+e3XNKyLEkVuG6+esMd270diV4/7zcTooEmk';
