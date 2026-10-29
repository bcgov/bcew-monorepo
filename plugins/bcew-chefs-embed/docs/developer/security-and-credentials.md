# Security and credentials

Each saved form is one row in `{prefix}bcew_chefs_credentials`, with the Form ID, encrypted API key, form name, confirmation message, created time, and user ID. On upgrade, a form name and confirmation still stored in `{prefix}bcew_chefs_options` are copied onto the matching credentials row, and that table is removed. API keys are encrypted before they are stored by `src/CredentialsManager.php`. `src/Crypto.php` encrypts them with libsodium `sodium_crypto_secretbox()`. The encryption key is derived from the WordPress authentication salts, so encrypted values depend on the WordPress installation's salts.

Implementation safeguard: do not decide whether a Form ID is new by calling `get_by_form_id()`. It returns `null` for both a missing row and an undecryptable key, while `save()` can still update an existing row. Use `CredentialsManager::form_exists()` to check for the row without decrypting the stored key.

The CHEFS Form block no longer reads stored credentials or exchanges an API key for a token. It loads a Public form anonymously through the CHEFS 1.1.0 viewer, provided the WordPress site's origin is allowed by the form. Credential-table and server-authentication cleanup are handled separately in DSWP-1367 and DSWP-1370. The remaining credential code must continue to keep API keys encrypted and out of client-side code until that cleanup is complete.

Do not commit API keys, add them to source code, or expose them in client-side code. Use non-production credentials for local testing.

When moving a database between environments, remember that different WordPress salts cannot decrypt the same stored API-key ciphertext. A database-only migration may require the credentials to be entered again.
