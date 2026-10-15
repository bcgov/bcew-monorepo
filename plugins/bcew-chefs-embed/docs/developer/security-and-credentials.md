# Security and credentials

The settings page requires the `manage_options` capability. Form save, deletion, and confirmation actions use WordPress admin-post handlers with nonce validation.

Each saved form is one row in `{prefix}bcew_chefs_credentials`, with the Form ID, encrypted API key, form name, confirmation message, created time, and user ID. On upgrade, a form name and confirmation still stored in `{prefix}bcew_chefs_options` are copied onto the matching credentials row, and that table is removed. API keys are encrypted before they are stored by `src/CredentialsManager.php`. `src/Crypto.php` encrypts them with libsodium `sodium_crypto_secretbox()`. The encryption key is derived from the WordPress authentication salts, so encrypted values depend on the WordPress installation's salts.

Implementation safeguard: do not decide whether a Form ID is new by calling `get_by_form_id()`. It returns `null` for both a missing row and an undecryptable key, while `save()` can still update an existing row. Use `CredentialsManager::form_exists()` to check for the row without decrypting the stored key. A valid replacement key for an existing row must preserve the saved form name and confirmation and report an update, even when the old key cannot be decrypted.

During form rendering, the server decrypts the API key and uses it only for the CHEFS token exchange. Basic Authentication is server-to-server. The API key remains server-side and is not included in block attributes, rendered HTML, frontend source, or REST responses. The short-lived token is intentionally returned by `embed-config` and the frontend assigns it to the CHEFS viewer's `auth-token` attribute so the browser can load the form. The token is not stored in the block's persisted attributes.

Do not commit API keys, add them to source code, or expose them in client-side code. Use the CHEFS settings page for configured credentials and use non-production credentials for local testing.

When moving a database between environments, remember that different WordPress salts cannot decrypt the same stored API-key ciphertext. A database-only migration may require the credentials to be entered again.
