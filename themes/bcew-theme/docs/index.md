# BC Extended Web Theme

`bcew-theme` is the core block theme providing styles, templates, and block pattern variations for British Columbia government sites.

## Overview

This theme provides:

- Core BC Government branding, fonts (BC Sans), colors, and design tokens.
- Template parts for standard headers, footers, breadcrumbs, search, and navigation.
- Block patterns for cards, hero images, contact info, and layout variations.

## Local Development

You can run WordPress locally for this theme using `wp-env`:

```bash
npx nx run bcew-theme:wp-env-start
npx nx run bcew-theme:start
```

or using Nx commands:

```bash
# Build theme assets
npx nx run bcew-theme:build

# Stop environment
npx nx run bcew-theme:wp-env-stop
```

## Where to learn more

- [Theme Overview & Activation](./overview)
- [Site Editor Patterns Guide](./guide/SiteEditor/Patterns/PatternsOverview)
- [How to Use Patterns](./guide/SiteEditor/Patterns/HowToUsePatterns)
- [Developer Template Parts Guide](./guide/Developers/TemplateParts)
- [Patterns Troubleshooting](./guide/Developers/Patterns/PatternsTroubleShooting)

