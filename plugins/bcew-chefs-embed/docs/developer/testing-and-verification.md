# Testing and verification

Run the build and test targets from the monorepo root:

```shell
npx nx run bcew-chefs-embed:build
npx nx run bcew-chefs-embed:test-integration
npx nx run bcew-chefs-embed:test-e2e
npx nx run bcew-chefs-embed:test-screenshot
```

Use `test-screenshot-generate` when updating approved screenshot baselines. The browser tests use the test environment on port `9013`.

## Manual smoke test

1. Start the environment with `npx nx run bcew-chefs-embed:wp-env-start`.
2. Open the development site at `http://localhost:9012` and confirm WordPress loads.
3. Use a published CHEFS form configured with the **Public** login option and add `http://localhost:9012` to its **Allowed origins** (Manage Form → Web Component). Until CHEFS 1.1.0 is deployed to production, follow [Test against the CHEFS PR-1966 deployment](./local-development.md#test-against-the-chefs-pr-1966-deployment).
4. Create a post and insert the CHEFS Form block.
5. Enter the Form ID or share URL. Confirm the saved block attribute contains only the normalized Form ID.
6. Confirm the editor preview loads without an API key or token.
7. Optionally enter a plain-text confirmation message, publish the post, and open it as an anonymous visitor.
8. Confirm the viewer loads, submissions show the configured confirmation, and the page source contains no API key or `auth-token`.

The CHEFS 1.1.0 release asset path used by the block is versioned and immutable. DSWP-1364's `https://chefs-dev.apps.silver.devops.gov.bc.ca/pr-1966` deployment can be used to verify the integration; do not use that development base URL in production. Automated E2E tests stub the viewer and do not verify CHEFS availability, versioned asset hosting, or allowed-origin configuration.
