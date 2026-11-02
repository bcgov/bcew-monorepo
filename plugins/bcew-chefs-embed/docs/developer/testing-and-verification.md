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
3. Create a post and insert the CHEFS Form block.
4. Enter a CHEFS Form ID and confirm the editor shows the read-only preview. Repeat with a share URL and verify the saved block attribute contains only the normalized Form ID.
5. Add a confirmation message, publish the post, and open it as a visitor.
6. Submit the public form and verify that the configured confirmation replaces the viewer. Repeat without a custom message and verify the generic success message.
7. Verify that the saved markup contains the viewer element, Form ID, and configured base URL, with no API key or runtime token. Confirm there is no block PHP render callback or CHEFS REST route.

The local WordPress environment can start without CHEFS credentials. Loading a real form requires network access to the configured CHEFS service and a form published as a Public form.
