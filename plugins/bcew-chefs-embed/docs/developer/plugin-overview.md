# Plugin overview

The plugin provides the `bcew-chefs-embed/chefs-form` dynamic block. It stores a selected CHEFS Form ID in the block content, while the corresponding API key is stored encrypted in the plugin's credentials table.

The plugin has no admin settings page. The **CHEFS Forms** admin menu links to the documentation.

The block does not embed a form directly in saved post content. WordPress renders a mount point, and the frontend script requests a short-lived CHEFS token before loading the CHEFS form viewer.
