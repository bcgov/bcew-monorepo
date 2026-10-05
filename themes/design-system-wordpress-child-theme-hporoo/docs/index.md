# Design System WordPress Child Theme — HPOROO

`design-system-wordpress-child-theme-hporoo` is a WordPress child theme built on top of `bcew-theme`, providing HPOROO-specific styles, patterns, and customizations for the BC Extended Web platform.

## Overview

This child theme extends the BC Government design system with:

- HPOROO branding and custom color schemes
- Customized block patterns and template variations
- HPOROO-specific navigation and layout adjustments
- Full inheritance from `bcew-theme` (parent theme)

## Local Development

You can run WordPress locally for this theme using `wp-env`:

```bash
npx nx run design-system-wordpress-child-theme-hporoo:wp-env-start
npx nx run design-system-wordpress-child-theme-hporoo:start
```

or using Nx commands:

```bash
# Build theme assets
npx nx run design-system-wordpress-child-theme-hporoo:build

# Run screenshot regression tests
npx nx run design-system-wordpress-child-theme-hporoo:test-screenshot

# Stop environment
npx nx run design-system-wordpress-child-theme-hporoo:wp-env-stop
```

## Parent Theme

This theme depends on `bcew-theme` as its parent. For core design system documentation and patterns, see [BC Extended Web Theme](../../bcew-theme/).

## Dependencies

- **Parent theme:** `themes/bcew-theme`
- **Required plugin:** `plugins/bcew-plugin` (provides navigation and breadcrumb components)
- **PHP version:** 7.4+
- **WordPress version:** 6.7.2+

