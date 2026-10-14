# REST API

Namespace comes from `RepositoryConfig::get_api_namespace` in `src/RepositoryConfig.php` (default: `bcew-document-repository/v1`).

- GET `/{namespace}/documents` — the REST default is `publish`, but only `trash` selects a distinct result set. `trash` returns trashed documents; `publish`, `draft`, `any`, `all`, and other values return all non-trashed documents (`publish`, `draft`, `pending`, and `private`).
- POST `/{namespace}/documents` — uploads a PDF and creates a document post with metadata.
- GET `/{namespace}/documents/check-duplicate?search_name={filename}` — checks duplicate original filenames.
- GET `/{namespace}/documents/{id}` — fetches a single document.

See `src/RestApiController.php`. Requests use the `wp_rest` nonce and the capability from `RepositoryConfig::get_capability` (default: `upload_files`).
