# Local development

Run commands from the monorepo root.

## Install dependencies

```shell
pnpm install
npx nx run bcew-chefs-embed:composer-install
```

The Composer target installs the plugin's PHP development dependencies. The plugin requires PHP 7.4.

## Build and start WordPress

```shell
npx nx run bcew-chefs-embed:build
npx nx run bcew-chefs-embed:wp-env-start
```

The local site is available at `http://localhost:9012`. WordPress Admin is available at `http://localhost:9012/wp-admin`.
The test environment uses port `9013` and is used by the Playwright targets. It is separate from the normal development site on port `9012`.

The `wp-env` lifecycle script activates the plugin after the environment starts. Build the assets again after changing block JavaScript, styles, or metadata.

## CHEFS authentication mock

The package-local `wp-env` setup enables `BCEW_CHEFS_E2E_MOCK` and installs a
test-only MU-plugin in the Playwright WordPress container on port `9013`. The
MU-plugin loads the mock from `tests/` and registers a server-side
`pre_http_request` filter, so automated tests do not call the live CHEFS service.

The mock accepts only the explicit Form ID and API key pairs used by the E2E
fixtures. An unknown Form ID returns a `404` `Bad formId` response, and a known
Form ID with a different API key returns a `403` response. This is important
for manual testing: arbitrary credentials fail the server-side token exchange,
so the block shows a load error instead of the form.

The MU-plugin also registers a test-only `bcew-chefs-embed-e2e/v1/forms` REST
route (`POST` to save a form ID and API key with an optional `confirmation`,
`DELETE` to remove all saved forms). Playwright helpers use it to seed forms.
It requires `manage_options` and only exists when `BCEW_CHEFS_E2E_MOCK` is set.

The development WordPress site on port `9012` does not enable the mock, so
developers can manually test real Form ID and API key combinations against
CHEFS. The mock is also not enabled in production. Do not add real API keys to
the fixture allowlist or commit them anywhere in the repository.

## Stop or reset WordPress

```shell
npx nx run bcew-chefs-embed:wp-env-stop
npx nx run bcew-chefs-embed:wp-env-clean
```
