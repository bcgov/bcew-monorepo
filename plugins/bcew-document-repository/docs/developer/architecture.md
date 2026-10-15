# Architecture

- Core orchestrator: `src/DocumentRepository.php`
- Configuration: `src/RepositoryConfig.php`
- Post type and taxonomies: `src/DocumentPostType.php`
- Uploads and attachment handling: `src/DocumentUploader.php`
- REST endpoints: `src/RestApiController.php`
- Metadata fields and caching: `src/DocumentMetadataManager.php`
- Admin assets and bootstrapping: `src/AdminUIManager.php`
- Settings toggle (enable/disable feature): `src/Settings.php`

Front-end/document behavior (search permalink override, title augmentation, publish after untrash) lives in `/bcew-document-repository.php`.
