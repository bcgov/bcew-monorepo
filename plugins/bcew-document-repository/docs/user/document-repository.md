# Document Repository

![Document Repository Overview](../images/bcew-document-repository-overview.png)

## Prerequisites and access

- Document Repository plugin installed and enabled.
- WordPress Search plugin installed and enabled to search document metadata.
- Admins and users with the configured Document Repository capability can upload, edit, and delete documents. The default capability is `upload_files`.

## Where to find it

In WordPress Admin: **Document Repository** (left navigation).

![Where To Find Document Repository](../images/where-to-find-bcew-document-repository.png)

## What you can do

- Upload PDF documents.
- Organize documents with titles and excerpts.
- Add custom metadata fields defined in **Metadata Settings**.
- Search and filter by document content and metadata.
- Use standard list and spreadsheet views.

## Upload a document

1. Go to **Document Repository** in WordPress Admin.
2. Drag files into the **Drag & Drop** area, or click **Choose Files**.
3. Select PDF files and click **Open**.
4. Uploaded documents appear in the list.

Only valid PDF files are accepted.

![Upload a Document](../images/bcew-document-repository-upload.gif)

## Edit document metadata

1. Go to **Document Repository**.
2. Click the pencil icon to open the editor, or edit inline in **Spreadsheet Mode**.
3. Update the **Title**, **Excerpt**, and any **Metadata Fields**.
4. Click **Save Changes**.

Taxonomy fields may contain one or more values, separated by commas or Enter.

![Edit a Document](../images/bcew-document-repository-edit.gif)

## Delete (trash) a document

1. Select documents and click **Trash Selected**, or click the **Trash** icon beside a document.
2. Review the confirmation and confirm, or cancel.

Trashed documents can be restored or permanently deleted from the **Trash** view. Permanent deletion removes the file and associated metadata.

![Delete a Document](../images/bcew-document-repository-delete.gif)

## Search documents

Use the **Search** box, enter a keyword, then press **Enter** or click **Search**. Search matches titles, excerpts, and metadata. Clear the input and search again, or click **X**, to reset.

![Search For Documents in the repository](../images/bcew-document-repository-search.gif)

## View modes

Standard view shows titles, excerpts, configured metadata, file size and type, revisions, and actions. Spreadsheet view shows documents and metadata in columns and supports inline editing. Use the **View Mode** toggle in the top-right to switch.

![Switch View Modes](../images/bcew-document-repository-view-modes.gif)

## Document revisions

1. Click **Revisions** for a document.
2. Use **Previous** and **Next** to navigate versions.
3. Click **Restore this Revision** to apply it; this opens the editor.
4. Optionally edit the revision text and save.

![Document Revisions](../images/bcew-document-repository-revisions.gif)

Documents can be **Published**, **Draft**, or **Pending Review**. To restore a trashed document, open **Trash**, select it, and click **Restore**.

## Tips and troubleshooting

- Use descriptive titles and excerpts; define metadata fields before large uploads.
- Confirm files are valid PDFs and within hosting size limits if upload fails.
- If search misses documents, ensure the WordPress Search plugin is active and has indexed metadata.
- If fields do not appear, create them in **Metadata Settings** and refresh.
- Verify user permissions if editing or deleting is unavailable.
