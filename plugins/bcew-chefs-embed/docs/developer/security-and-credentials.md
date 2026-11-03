# Security and credentials

Each saved form is one row in `{prefix}bcew_chefs_credentials`, with the Form ID, encrypted API key, form name, confirmation message, created time, and user ID. On upgrade, a form name and confirmation still stored in `{prefix}bcew_chefs_options` are copied onto the matching credentials row, and that table is removed. API keys are encrypted before they are stored by `src/CredentialsManager.php`. `src/Crypto.php` encrypts them with libsodium `sodium_crypto_secretbox()`. The encryption key is derived from the WordPress authentication salts, so encrypted values depend on the WordPress installation's salts.

Implementation safeguard: do not decide whether a Form ID is new by calling `get_by_form_id()`. It returns `null` for both a missing row and an undecryptable key, while `save()` can still update an existing row. Use `CredentialsManager::form_exists()` to check for the row without decrypting the stored key.

During form rendering, the server decrypts the API key and uses it only for the CHEFS token exchange. Basic Authentication is server-to-server. The API key remains server-side and is not included in block attributes, rendered HTML, frontend source, or REST responses. The short-lived token is intentionally returned by `embed-config` and the frontend assigns it to the CHEFS viewer's `auth-token` attribute so the browser can load the form. The token is not stored in the block's persisted attributes.

Do not commit API keys, add them to source code, or expose them in client-side code. Use non-production credentials for local testing.

When moving a database between environments, remember that different WordPress salts cannot decrypt the same stored API-key ciphertext. A database-only migration may require the credentials to be entered again.

## Viewer script integrity

The CHEFS form viewer script (`chefs-form-viewer.min.js`) is loaded with
[Subresource Integrity (SRI)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
by `src/chefs-form/utils/ensure-chefs-form-viewer.js`.

CHEFS publishes an `integrity.json` manifest for each immutable embed version.
It maps each asset path, relative to the version root, to its SRI hash:

```json
{
	"embed/chefs-form-viewer.min.js": "sha384-..."
}
```

The loader:

1. Builds both URLs from the block's CHEFS base URL and `CHEFS_EMBED_VERSION`, for example `{base}/embed/1.1.0/integrity.json` and `{base}/embed/1.1.0/embed/chefs-form-viewer.min.js`.
2. Fetches the manifest without credentials and reads the hash stored under `embed/chefs-form-viewer.min.js`.
3. Injects the script with `integrity` set to that hash and `crossorigin="anonymous"`.

The script is not injected when the manifest is unavailable, the configured
version does not exist (the manifest returns `404`), or the hash is missing or
not a valid `sha256`/`sha384`/`sha512` value. If the script content does not
match the hash, the browser blocks it. In every case the block shows its
existing load error; no other handling is added.

Residual risk: the manifest is served from the same CHEFS origin as the
script, so SRI detects a changed or swapped script file but does not protect
against a full compromise of the CHEFS host that also changes the manifest.
SRI covers only `chefs-form-viewer.min.js`; assets that the viewer loads
itself (for example Form.io scripts, styles, and fonts) are not covered.

### Upgrading the CHEFS embed version

The embed version and all asset URLs are configured in
`src/chefs-form/utils/constants.js`:

- `CHEFS_EMBED_VERSION` — the only value to change for an upgrade.
- `getChefsEmbedUrls()` — builds the version-specific viewer script and integrity manifest URLs.

To upgrade:

1. Confirm CHEFS has published `{base}/embed/<version>/integrity.json` and that it contains an `embed/chefs-form-viewer.min.js` entry.
2. Update `CHEFS_EMBED_VERSION`.
3. Update the version asserted in `tests/e2e/chefs-form-frontend.spec.js`.
4. Rebuild and run the E2E tests.
