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
7. Verify that the saved markup includes the `chefs-form-viewer` element with the Form ID and configured base URL.

Testing a real form requires network access to the configured CHEFS service and a form published as a Public form.

## Administration documentation links

1. Sign in as an administrator and open the Plugins page.
2. Use the keyboard to focus and follow **User documentation** in the BCEW CHEFS Embed plugin's row. Confirm it opens the published **User docs** guide in the current tab.
3. Return to WordPress and follow **CHEFS Documentation** in the admin sidebar. Confirm it opens the same user-guide URL in the current tab.
4. Confirm other plugins' metadata links are unchanged and there is no CHEFS Forms options page.
