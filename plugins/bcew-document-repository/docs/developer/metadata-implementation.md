# Metadata implementation

Metadata fields (text, date, taxonomy) are defined in Metadata Settings. Taxonomy fields automatically register a taxonomy with a `doc_` prefix.

- Fields: `Bcgov\Bcew\DocumentRepository\DocumentMetadataManager::get_metadata_fields`
- Taxonomies: `Bcgov\Bcew\DocumentRepository\DocumentPostType::register_metadata_taxonomies`
- Updated action: `bcgov_document_repository_metadata_fields_updated`
