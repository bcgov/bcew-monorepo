# Plugin overview

The plugin provides the `bcew-chefs-embed/chefs-form` block. It stores the CHEFS Form ID and optional confirmation override in the post content, then loads a Public form through the versioned CHEFS viewer without an API key or token.

The plugin has no admin settings page. The **CHEFS Documentation** admin menu links to the documentation.

The block saves a mount point in the post content. The editor preview and frontend script load the CHEFS 1.1.0 viewer directly. The CHEFS form must allow the WordPress site's origin.
