# Testing and verification

Run the build and test targets from the monorepo root:

```shell
npx nx run bcew-chefs-embed:build
npx nx run bcew-chefs-embed:test-integration
npx nx run bcew-chefs-embed:test-e2e
npx nx run bcew-chefs-embed:test-screenshot
```

Use `test-screenshot-generate` when updating approved screenshot baselines. The browser tests use the test environment on port `9013`.

The successful SRI browser test serves a tiny fake viewer and computes its SHA-384 hash. It substitutes that hash only in the intercepted frontend bundle, after asserting the bundle contains the runtime pin. This checks successful browser SRI loading, not whether the runtime pin matches the live CHEFS release; the failure and retry tests use the unchanged runtime pin.

## Manual smoke test

1. Start the environment with `npx nx run bcew-chefs-embed:wp-env-start`.
2. Open the development site at `http://localhost:9012` and confirm WordPress loads.
3. Create a post and insert the CHEFS Form block.
4. Enter a CHEFS Form ID and confirm the editor shows the read-only preview. Repeat with a share URL and verify the saved block attribute contains only the normalized Form ID.
5. Add a confirmation message, publish the post, and open it as a visitor.
6. Submit the public form and verify that the configured confirmation replaces the viewer. Repeat without a custom message and verify the generic success message.
7. Verify that the saved markup includes the `chefs-form-viewer` element with the Form ID and configured base URL.
8. In browser developer tools, confirm the `chefs-form-viewer.min.js` script tag has an `integrity` attribute matching `CHEFS_EMBED_INTEGRITY` and `crossorigin="anonymous"`.

Testing a real form requires network access to the configured CHEFS service and a form published as a Public form.
