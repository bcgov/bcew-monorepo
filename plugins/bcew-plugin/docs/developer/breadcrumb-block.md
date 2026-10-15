# BreadCrumb Block

- Dynamic server-side rendering is implemented in PHP in `render.php`; breadcrumb HTML is not stored in post content.
- RTL-compatible styles are provided by a separate compiled CSS file.

## Styling and customization

- Target wrapper selector: `.dswp-block-breadcrumb__container`.
- Separator element: `.dswp-breadcrumb-separator`.
- Provide overrides in a theme stylesheet or a global style variation.
- RTL adjustments are handled by generated `style-index-rtl.css`.

## Performance

Dynamic rendering avoids recalculating trails client-side. Markup is minimal and styles are precompiled.

## Limitations

There is no built-in schema markup; it can be added in a theme if desired.
