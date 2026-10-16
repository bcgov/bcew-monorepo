# File storage and search behavior

Files are stored under `/uploads/documents`; `DocumentUploader::custom_upload_dir` in `src/DocumentUploader.php` manages the upload directory. Document search permalinks link to the file URL, and titles include file type and size. This behavior is implemented in `bcew-document-repository.php`.
