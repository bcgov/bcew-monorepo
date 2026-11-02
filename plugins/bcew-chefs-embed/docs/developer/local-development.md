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

The block loads the CHEFS viewer directly in the editor preview and on the
published page. Testing a real form therefore requires network access to the
configured CHEFS service and a published Public form; no plugin credentials or
API keys are needed.

## Stop or reset WordPress

```shell
npx nx run bcew-chefs-embed:wp-env-stop
npx nx run bcew-chefs-embed:wp-env-clean
```
