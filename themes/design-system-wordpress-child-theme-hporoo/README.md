# Design System WordPress Theme Child Theme: HPOROO

![Lifecycle:Experimental](https://img.shields.io/badge/Lifecycle-Experimental-339999)

## Development Setup

```zsh
git clone https://github.com/bcgov/design-system-wordpress-child-theme-hporoo.git
cd design-system-wordpress-child-theme-hporoo.git
composer install
npm i
npm run start
```

## Build

```bash
npm run build:production
composer checklist
```

## Visual Regression Testing

This project uses Playwright to perform visual regression testing of patterns to help catch unintended changes.

```bash
npm run wp-env start # Unless already running
npm run test:screenshot
```

**Note**: When creating a new block it must be added to `tests/screenshot/style-book.spec.js` in order to be included in regression tests.

### Updating Screenshots

- Screenshots should be updated when intentional changes are made to patterns so the above tests can run against the latest versions of the Blocks in the Style Book.
- The `visual-regression` workflow runs the `update` script and commits changes automatically on pull requests, so it's not necessary to commit any updates made locally to the screenshots, but it can still be useful for local development to see what effects your changes will have.

```bash
npm run wp-env start # Unless already running
npm run test:screenshot:update
```
