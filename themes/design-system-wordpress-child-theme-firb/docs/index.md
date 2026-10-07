# Design System WordPress Child Theme: FIRB

`design-system-wordpress-child-theme-firb` is a BCEW child theme for FIRB. It uses `bcew-theme` as its parent and the shared monorepo tooling for development and visual regression testing.

## Local Development

Run commands from the monorepo root:

```bash
npx nx run design-system-wordpress-child-theme-firb:build --no-tui
npx nx run design-system-wordpress-child-theme-firb:wp-env-start --no-tui
```

The development site runs at `http://localhost:9020` and the test site runs at `http://localhost:9021`.

## Visual Regression Testing

Screenshot tests use the shared `packages/e2e` helpers:

```bash
npx nx run design-system-wordpress-child-theme-firb:test-screenshot --no-tui
```

To regenerate baselines after an intentional visual change:

```bash
npx nx run design-system-wordpress-child-theme-firb:test-screenshot-generate --no-tui
```

## Dependencies

- Parent theme: `themes/bcew-theme`
- Required plugin: `plugins/bcew-plugin`
- PHP: 7.4
- WordPress: 6.7.2
