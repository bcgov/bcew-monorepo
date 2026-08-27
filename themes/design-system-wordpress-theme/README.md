# Design System WordPress Theme

![Lifecycle:Experimental](https://img.shields.io/badge/Lifecycle-Experimental-339999)

## Development Setup

This theme is developed inside the monorepo checkout, not as a standalone repository.

```bash
git clone https://github.com/bcgov/bcew-monorepo.git
cd bcew-monorepo
pnpm install
composer install
npx nx run design-system-wordpress-theme:wp-env-start
npx nx run design-system-wordpress-theme:start
```

## Build

```bash
npx nx run design-system-wordpress-theme:build
```

## E2E Testing

This project uses Playwright with `@wordpress/e2e-test-utils-playwright` for end-to-end tests that run against a live WordPress environment. Tests are located in `themes/design-system-wordpress-theme/tests/e2e/`.

```bash
npx nx run design-system-wordpress-theme:wp-env-start
npx nx run design-system-wordpress-theme:test-e2e
```

To run a single test file:

```bash
npx nx run design-system-wordpress-theme:wp-env-start
(cd themes/design-system-wordpress-theme && npx playwright test tests/e2e/copyright-shortcode.spec.ts)
```

To step through each test in headed mode for debugging:

```bash
npx playwright test themes/design-system-wordpress-theme/tests/e2e/ --debug
```

## Visual Regression Testing

This project uses Playwright to perform visual regression testing of patterns to help catch unintended changes.

```bash
npx nx run design-system-wordpress-theme:wp-env-start
npx nx run design-system-wordpress-theme:test-screenshot
```

**Note**: When creating a new pattern it must be added to `themes/design-system-wordpress-theme/tests/screenshot/patterns.spec.js` in order to be included in regression tests.

### Updating Screenshots

The pull-request workflow compares against committed screenshot baselines and does not update them. After running the generation target locally, review and commit any intended snapshot changes.

```bash
npx nx run design-system-wordpress-theme:wp-env-start
npx nx run design-system-wordpress-theme:test-screenshot-generate
```

## End-to-End (E2E) Testing

This project uses Playwright for end-to-end testing, which includes theme functionality and configuration validation.

### Run all E2E tests

```bash
npx nx run design-system-wordpress-theme:wp-env-start
npx nx run design-system-wordpress-theme:test-e2e
```

### Available E2E tests

#### CSS Custom Properties Tests (`tests/e2e/css-props.spec.ts`)

Validates that theme CSS custom properties are properly defined in both standalone built CSS and WordPress runtime contexts, plus validates layout sizing properties.

**Checks:**

1. **Standalone built CSS**: Verifies that theme-level custom properties (e.g., `--dswp-*` and `--bcds-*`) are present in the compiled CSS output from your build.
2. **WordPress runtime**: Verifies that WordPress-generated custom properties (e.g., `--wp--custom--dswp--*` from `theme.json`) are available when the site editor is loaded.
3. **Layout wide size**: Verifies that the `--dswp-layout-wide-size` custom property is set to `1200px` in the site editor runtime.

**Run individually:**

```bash
npx nx run design-system-wordpress-theme:wp-env-start
npx playwright test themes/design-system-wordpress-theme/tests/e2e/css-props.spec.ts
```

If a check fails, the test output will list the missing properties or incorrect values, indicating a potential mismatch between `theme.json` definitions and the compiled CSS or WordPress runtime state.

#### Hero Image Block Tests (`tests/e2e/hero-variation.spec.ts`)

Validates that the Hero Image block (cover block with inner content) renders correctly with various field combinations, including all-fields-filled and title-only variations, with visual regression snapshots for desktop and mobile viewports.

**Run individually:**

```bash
npx nx run design-system-wordpress-theme:wp-env-start
npx playwright test themes/design-system-wordpress-theme/tests/e2e/hero-variation.spec.ts
```

## Child Themes

### Template Part Override Guidelines

To ensure child themes can properly override template parts, parent theme template-part blocks **must not** include a `theme` attribute. Including the `theme` attribute prevents child themes from overwriting the template part.

**Incorrect (prevents child theme overrides):**

```html
<!-- wp:template-part {"slug":"breadcrumb","align":"full","theme":"design-system-wordpress-theme"} /-->
```

**Correct (allows child theme overrides):**

```html
<!-- wp:template-part {"slug":"breadcrumb","align":"full"} /-->
```

Run `pnpm lint-template-parts` from the monorepo root (or `npx nx run design-system-wordpress-theme:lint-template-parts` for this theme only) to validate locally. This check also runs automatically on pull requests as part of the `Lint monorepo` workflow job.

The validator lives at `tools/validate-template-parts.mjs` and is opt-in: a theme enables it by declaring the `lint-template-parts` target in its `project.json`. Child themes intentionally do not enable it, since nothing overrides their template parts.

