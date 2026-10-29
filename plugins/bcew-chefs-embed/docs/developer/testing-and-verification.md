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
2. Open the development site at `http://localhost:9012` and confirm WordPress loads. Use port `9012` for manual tests with real CHEFS credentials because this site connects to the real CHEFS authentication endpoint. Do not use the Playwright test site on port `9013`, where CHEFS authentication is mocked.
3. Save a Form ID, form name, and API key, for example with `wp-env run cli wp eval '\Bcgov\BcewChefsEmbed\CredentialsManager::save( "<form-id>", "<api-key>", 1 ); \Bcgov\BcewChefsEmbed\CredentialsManager::save_form_name( "<form-id>", "<form-name>" );'`.
4. Create a post and insert the CHEFS Form block.
5. Confirm the saved Form ID appears in the block sidebar.
6. Select the Form ID and confirm the editor preview loads when valid CHEFS credentials and network access are available.
7. Publish the post and open it as an anonymous visitor.
8. Confirm the form loads through `embed-config`.
9. Verify that the CHEFS API key is not present in the page source, frontend code, or REST response. The REST response may contain the short-lived token used to load the form.

The local WordPress environment can be started without live CHEFS credentials, but loading and submitting a real form on port `9012` requires valid credentials and access to the CHEFS service.
