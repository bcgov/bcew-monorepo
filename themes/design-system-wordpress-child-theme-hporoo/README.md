# Design System WordPress Theme Child Theme: HPOROO

HPOROO is a BCEW child theme. Its parent theme is `bcew-theme`.

Development environment setup and shared monorepo workflows are documented in [Getting started](../../docs/getting-started.md) and [tools/monorepo/README.md](../../tools/monorepo/README.md).

## Building

Run commands from the monorepo root:

```bash
npx nx run design-system-wordpress-child-theme-hporoo:build
```

For watch mode:

```bash
npx nx run design-system-wordpress-child-theme-hporoo:start
```

## Visual Regression Testing

Screenshot tests are in `tests/screenshot/`.

Start the local WordPress environment when needed:

```bash
npx nx run design-system-wordpress-child-theme-hporoo:wp-env-start
```

Run screenshot regression tests:

```bash
npx nx run design-system-wordpress-child-theme-hporoo:test-screenshot
```

Generate updated snapshots for intentional visual changes:

```bash
npx nx run design-system-wordpress-child-theme-hporoo:test-screenshot-generate
```

The current screenshot suite is defined in `tests/screenshot/style-book.spec.ts`.
