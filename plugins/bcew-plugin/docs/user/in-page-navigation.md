# In-Page Navigation

Provides an automatic table of contents for Pages by collecting all H2 headings and presenting numbered jump links.

![In-Page Navigation example](../images/IN_PAGE_VIEW.png)

## When it appears

- Only on Page post type.
- Only if at least one H2 exists.
- Enabled per page via a toggle in the editor sidebar.

![In-page Navigation HOWTO](../images/IN_PAGE_NAV_ENABLE.gif)

## In-Page Navigation behavior

- Renders an aside containing numbered links to each section.
- Shows the optional page excerpt at the top, if set.
- Highlights the active section while scrolling (mobile emphasis).
- Smooth scroll on link click.

## Editor usage

1. Edit a Page.
2. Open the “In-page Navigation” panel in the document settings.
3. Toggle “Enable in-page navigation” on.
4. Update the Page.

![In-page Navigation HOWTO](../images/IN_PAGE_NAVIGATION_DEMO.gif)

## Responsive behavior

- Desktop (>768px): Expanded list always visible.
- Mobile (≤768px): Sticky bar; toggle button collapses/expands; current section emphasized; background lightens after scroll.

![In-page Navigation mobile view](../images/NAV_MOBILE_VIEW.gif)

## Excerpt

If the Page has an excerpt, it is shown at the top of the navigation for context.
