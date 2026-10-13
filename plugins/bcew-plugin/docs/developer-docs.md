# Developer docs

Implementation details for the features documented in [User docs](./user-docs).

## In-Page Navigation

- Scans H2 elements and adds IDs if missing, using the heading slug and index.
- Example generated ID: `section-getting-started-0` for “Getting Started”.
- Uses theme root padding variables; no user configuration is required.

## Navigation Block

If both visibility settings are disabled, the block still renders as a safety fallback to avoid hiding site navigation entirely. To truly hide it, use theme visibility controls or CSS.

## BreadCrumb Block

- Dynamic server-side rendering is implemented in PHP in `render.php`; breadcrumb HTML is not stored in post content.
- RTL-compatible styles are provided by a separate compiled CSS file.

### Styling and customization

- Target wrapper selector: `.dswp-block-breadcrumb__container`.
- Separator element: `.dswp-breadcrumb-separator`.
- Provide overrides in a theme stylesheet or a global style variation.
- RTL adjustments are handled by generated `style-index-rtl.css`.

### Performance

Dynamic rendering avoids recalculating trails client-side. Markup is minimal and styles are precompiled.

### Limitations

There is no built-in schema markup; it can be added in a theme if desired.

## Related documentation

- [User docs](./user-docs) for site-author and administrator instructions.
- [Plugin overview](./index).
