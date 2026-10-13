# Developer docs

This guide describes the existing implementation and development setup for the Document Repository plugin.

## Architecture

- Core orchestrator: `src/DocumentRepository.php`
- Configuration: `src/RepositoryConfig.php`
- Post type and taxonomies: `src/DocumentPostType.php`
- Uploads and attachment handling: `src/DocumentUploader.php`
- REST endpoints: `src/RestApiController.php`
- Metadata fields and caching: `src/DocumentMetadataManager.php`
- Admin assets and bootstrapping: `src/AdminUIManager.php`
- Settings toggle (enable/disable feature): `src/Settings.php`

Front-end/document behavior (search permalink override, title augmentation, publish after untrash) lives in `/bcew-document-repository.php`.

## Admin UI implementation

The admin app mounts under “Document Repository” and “Metadata Settings”. It supports PDF uploads, metadata editing, spreadsheet mode, bulk operations, status filters, and upload feedback.

- App entry: `/assets/js/apps/bcew-document-repository/index.js`
- Main app: `/assets/js/apps/bcew-document-repository/App.js`
- Styles: `/assets/scss/index.scss`

## Metadata implementation

Metadata fields (text, date, taxonomy) are defined in Metadata Settings. Taxonomy fields automatically register a taxonomy with a `doc_` prefix.

- Fields: `Bcgov\Bcew\DocumentRepository\DocumentMetadataManager::get_metadata_fields`
- Taxonomies: `Bcgov\Bcew\DocumentRepository\DocumentPostType::register_metadata_taxonomies`
- Updated action: `bcgov_document_repository_metadata_fields_updated`

## REST API

Namespace comes from `RepositoryConfig::get_api_namespace` in `src/RepositoryConfig.php` (default: `bcew-document-repository/v1`).

- GET `/{namespace}/documents` — the REST default is `publish`, but only `trash` selects a distinct result set. `trash` returns trashed documents; `publish`, `draft`, `any`, `all`, and other values return all non-trashed documents (`publish`, `draft`, `pending`, and `private`).
- POST `/{namespace}/documents` — uploads a PDF and creates a document post with metadata.
- GET `/{namespace}/documents/check-duplicate?search_name={filename}` — checks duplicate original filenames.
- GET `/{namespace}/documents/{id}` — fetches a single document.

See `src/RestApiController.php`. Requests use the `wp_rest` nonce and the capability from `RepositoryConfig::get_capability` (default: `upload_files`).

## File storage and search behavior

Files are stored under `/uploads/documents`; `DocumentUploader::custom_upload_dir` in `src/DocumentUploader.php` manages the upload directory. Document search permalinks link to the file URL, and titles include file type and size. This behavior is implemented in `bcew-document-repository.php`.

## Requirements and development setup

- WordPress 6.7+
- PHP 7.4+
- Composer
- Node.js `^24.12.0`
- pnpm (the monorepo package manager)

From the monorepo root:

```shell
pnpm install
npx nx run bcew-document-repository:composer-install
npx nx run bcew-document-repository:build
# Optional: start a local WordPress environment
npx nx run bcew-document-repository:wp-env-start
```

After these steps, activate the plugin from WordPress Admin (or use the wp-env site).
