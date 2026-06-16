# bcew-belleville-terminal

Theme intended to be used with the Design System WordPress Theme suite of products.

## Notes

- Provides a BCEW theme implementation for Design System WordPress sites.
- Operational and monorepo workflow instructions are maintained centrally in `tools/monorepo/README.md`.

### Building the theme for development purposes

Run the build command from the monorepo root:

```bash
npx nx run bcew-belleville-terminal:build
```

This compiles theme assets and prepares the theme for development.

For dynamic building as you change properties, run the start command:

```bash
npx nx run bcew-belleville-terminal:start
```

This watches for changes and rebuilds the theme automatically.

### Browser Testing (Visual Regression)

Run browser tests for this theme from the monorepo root:

- Visual regression tests use spec files under `./tests/screenshot`.

These tests are also executed in GitHub CI on pull requests. See `.github/workflows/pr.yml`.

1. Start the theme test environment (optional - the nx target will run this automatically):

	```bash
	npx nx run bcew-belleville-terminal:wp-env-start
	```

1. Run all visual regression tests:

	```bash
	npx nx run bcew-belleville-terminal:test-screenshot
	```

1. Run one visual regression spec file:

	```bash
	npx nx run bcew-belleville-terminal:test-screenshot -- ./tests/screenshot/example.spec.js
	```

1. Run one visual regression spec file in Playwright debug mode:

	```bash
	npx nx run bcew-belleville-terminal:test-screenshot -- --debug ./tests/screenshot/example.spec.js
	```
