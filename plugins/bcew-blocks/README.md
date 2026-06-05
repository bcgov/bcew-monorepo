# BCEW Blocks

Plugin containing blocks intended to be used with the Design System WordPress Theme suite of products.

## Notes

- Provides custom Gutenberg blocks for Design System WordPress implementations.
- Current block docs are available in `./docs/index.md`.
- This plugin is intended for sites using the Design System WordPress Theme suite.
- Operational and monorepo workflow instructions are maintained centrally in `tools/monorepo/README.md`.

### Browser Testing (E2E and Visual Regression)

Run browser tests for this plugin from the monorepo root:

- End-to-end tests use spec files under ./tests/e2e.
- Visual regression tests use spec files under ./tests/screenshot.

These tests are also executed in GitHub CI on pull requests. See .github/workflows/pr.yml.

1. Start the plugin test environment (optional - the nx target will run this automatically):

    ```bash
    npx nx run bcew-blocks:wp-env-start
    ```

1. Run all e2e tests:

    ```bash
    npx nx run bcew-blocks:test-e2e
    ```

1. Run one e2e spec file:

    ```bash
    npx nx run bcew-blocks:test-e2e -- ./tests/e2e/media-text-layout.spec.ts
    ```

1. Run one e2e spec file in Playwright debug mode:

    ```bash
    npx nx run bcew-blocks:test-e2e -- --debug ./tests/e2e/media-text-layout.spec.ts
    ```

1. Run all visual regression tests:

    ```bash
    npx nx run bcew-blocks:test-screenshot
    ```

1. Run one visual regression spec file:

    ```bash
    npx nx run bcew-blocks:test-screenshot -- ./tests/screenshot/media-text-layout.spec.js
    ```

1. Run one visual regression spec file in Playwright debug mode:

    ```bash
    npx nx run bcew-blocks:test-screenshot -- --debug ./tests/screenshot/media-text-layout.spec.js
    ```
