# BCEW Plugin Template

- `assets/` holds images, CSS, and JavaScript shared by the whole plugin.
- `languages/` holds translation files for the plugin.
- `parts/` is a block theme folder. WordPress does not load it from a plugin. A plugin that swaps a header or footer does that through the Site Editor.
- `templates/` holds PHP markup the plugin renders itself. A theme can override those files. Block theme HTML templates belong in the theme, not here.
- `src/Admin/` holds a screen in wp-admin.
- `src/AdminBar/` holds a node on the top toolbar.
- `src/Ajax/` holds an admin-ajax handler.
- `src/Bindings/` holds a block binding source.
- `src/Cli/` holds a WP-CLI command.
- `src/Comments/` holds a change to comments or the comment form.
- `src/Cron/` holds a scheduled event.
- `src/Customizer/` holds a control in the Theme Customizer.
- `src/Database/` holds a custom database table.
- `src/Editor/` holds a block-editor format, sidebar, or meta box.
- `src/Embeds/` holds an oEmbed provider.
- `src/Feeds/` holds an RSS or Atom feed.
- `src/Http/` holds a call to another server with the WordPress HTTP API.
- `src/Import/` holds a WordPress import or export.
- `src/Install/` holds activation, deactivation, and version upgrades.
- `src/Mail/` holds mail sent with wp_mail.
- `src/Media/` holds a change to uploads or the media library.
- `src/Menus/` holds a nav menu item or a menu location.
- `src/Meta/` holds post meta, term meta, or user meta.
- `src/Network/` holds a multisite network screen, or setup when a new site is created.
- `src/Patterns/` holds a block pattern.
- `src/PostTypes/` holds a custom post type.
- `src/Privacy/` holds a personal-data export or erase callback.
- `src/Rest/` holds a /wp-json route.
- `src/Rewrites/` holds a rewrite rule or a custom URL endpoint.
- `src/Roles/` holds a role or a capability.
- `src/Shortcodes/` holds a shortcode.
- `src/Sitemaps/` holds a custom sitemap provider.
- `src/SiteHealth/` holds a Site Health test.
- `src/Taxonomies/` holds a taxonomy.
- `src/Users/` holds a change to user profiles, registration, or the user list.
- `src/Widgets/` holds a widget.
- `src/noticed-block/` holds the Noticed block.

## Plugin examples

| Folder | Plugin | What it does |
|---|---|---|
| `assets/` | [Contact Form 7](https://wordpress.org/plugins/contact-form-7/) | Ships the CSS and JavaScript the form needs |
| `languages/` | [Custom Block Patterns](https://wordpress.org/plugins/custom-block-patterns/) | Ships translations, including Japanese, Spanish, and Swedish |
| `parts/` | [Dynamic Template Parts](https://wordpress.org/plugins/dynamic-template-parts/) | Swaps a header or footer template part in the Site Editor |
| `templates/` | [WooCommerce](https://wordpress.org/plugins/woocommerce/) | Ships PHP templates a theme can override |
| `src/Admin/` | [WP Crontrol](https://wordpress.org/plugins/wp-crontrol/) | Adds the Tools → Cron Events screen |
| `src/AdminBar/` | [Better Admin Bar](https://wordpress.org/plugins/better-admin-bar/) | Hides or restyles the toolbar |
| `src/Ajax/` | [Contact Form 7](https://wordpress.org/plugins/contact-form-7/) | Submits the form through admin-ajax |
| `src/Bindings/` | [Lax Block Binder](https://wordpress.org/plugins/lax-block-binder/) | Binds a core block to post meta with `register_block_bindings_source()` |
| `src/Cli/` | [Gravity Forms CLI](https://wordpress.org/plugins/gravityformscli/) | Adds `wp gf` commands for forms and entries |
| `src/Comments/` | [Akismet](https://wordpress.org/plugins/akismet/) | Checks each comment and holds the spam |
| `src/Cron/` | [WP Crontrol](https://wordpress.org/plugins/wp-crontrol/) | Lists, adds, and runs scheduled events |
| `src/Customizer/` | [Customize Plus](https://wordpress.org/plugins/customize-plus/) | Adds controls to the Theme Customizer |
| `src/Database/` | [Events Manager](https://wordpress.org/plugins/events-manager/) | Creates its own booking tables with `dbDelta` |
| `src/Editor/` | [NexLink](https://wordpress.org/plugins/nexlink/) | Adds a panel in the block editor sidebar |
| `src/Embeds/` | [Upcellia Forms oEmbed](https://wordpress.org/plugins/upcellia-forms-oembed/) | Registers a URL with `wp_oembed_add_provider()` |
| `src/Feeds/` | [Custom RSS Feeds](https://wordpress.org/plugins/custom-feeds/) | Adds an RSS feed with its own slug |
| `src/Http/` | [Akismet](https://wordpress.org/plugins/akismet/) | Sends each comment to the Akismet API |
| `src/Import/` | [WordPress Importer](https://wordpress.org/plugins/wordpress-importer/) | Imports posts, comments, and users from a WXR file |
| `src/Install/` | [Slotify](https://wordpress.org/plugins/slotify-appointment-booking-system/) | Creates its appointments table on activation |
| `src/Mail/` | [WP Mail SMTP](https://wordpress.org/plugins/wp-mail-smtp/) | Sends WordPress mail through an SMTP server |
| `src/Media/` | [Advanced Custom Fields](https://wordpress.org/plugins/advanced-custom-fields/) | Adds fields to media items in the library |
| `src/Menus/` | [Nav Menu Roles](https://wordpress.org/plugins/nav-menu-roles/) | Hides a menu item by role |
| `src/Meta/` | [Advanced Custom Fields](https://wordpress.org/plugins/advanced-custom-fields/) | Stores custom fields as post meta |
| `src/Network/` | [MultiSyde](https://wordpress.org/plugins/multisyde/) | Adds network-admin screens for a multisite install |
| `src/Patterns/` | [Custom Block Patterns](https://wordpress.org/plugins/custom-block-patterns/) | Registers patterns you build in the editor |
| `src/PostTypes/` | [Custom Post Type UI](https://wordpress.org/plugins/custom-post-type-ui/) | Registers custom post types |
| `src/Privacy/` | [AxiTrace for WooCommerce](https://wordpress.org/plugins/axitrace-for-woocommerce/) | Adds a personal-data exporter and eraser |
| `src/Rest/` | [Events Manager](https://wordpress.org/plugins/events-manager/) | Adds `/wp-json/` routes for events and bookings |
| `src/Rewrites/` | [Custom Post Type Rewrite](https://wordpress.org/plugins/custom-post-type-rewrite/) | Adds permalink rules with `add_rewrite_rule()` |
| `src/Roles/` | [User Role Editor](https://wordpress.org/plugins/user-role-editor/) | Creates roles and edits capabilities |
| `src/Shortcodes/` | [Contact Form 7](https://wordpress.org/plugins/contact-form-7/) | Renders a form with the `[contact-form-7]` shortcode |
| `src/Sitemaps/` | [XML Sitemap & Google News](https://wordpress.org/plugins/xml-sitemap-feed/) | Adds a Google News sitemap on top of the core one |
| `src/SiteHealth/` | [Site Health Tools](https://wordpress.org/plugins/site-health-tools/) | Adds tools to the Site Health screen |
| `src/Taxonomies/` | [Custom Post Type UI](https://wordpress.org/plugins/custom-post-type-ui/) | Registers custom taxonomies |
| `src/Users/` | [Advanced Custom Fields](https://wordpress.org/plugins/advanced-custom-fields/) | Adds fields to user profiles |
| `src/Widgets/` | [Newsknit RSS](https://wordpress.org/plugins/newsknit-rss/) | Adds a classic widget for a news feed |
| `src/noticed-block/` | [Advanced Custom Fields](https://wordpress.org/plugins/advanced-custom-fields/) | Registers custom blocks through ACF Blocks |
