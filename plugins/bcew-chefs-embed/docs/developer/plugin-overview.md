# Plugin overview

The plugin provides the `bcew-chefs-embed/chefs-form` static block. It stores the CHEFS Form ID and optional confirmation message in the block content. Authors can enter either the Form ID or its share URL; the block saves only the normalized Form ID.

The **CHEFS Documentation** admin menu links to the documentation.

The block saves a `chefs-form-viewer` element in post content. The editor displays a read-only preview, and the frontend script loads the CHEFS viewer and handles submission success and errors.
