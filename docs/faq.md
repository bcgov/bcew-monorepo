# TroubleShooting


## Troubleshooting from p

| Symptom | Things to check |
| --- | --- |
| **Module not found** after adding an import | Add the dependency to that package’s `package.json` and run `pnpm install` from root. |
| **Wrong version** of a transitive dep | Add a **direct** devDependency or use pnpm `overrides` at root (sparingly, with team agreement). |
| **Peer dependency warnings** | Install the peer into the package that consumes it or align versions with `@wordpress/*` packages. |
| **Duplicate React** or block editor issues | Ensure a single version of `@wordpress/*` across the workspace; check root and package `package.json` alignment. |
| **Composer path not found** | Verify `url` in `composer.json` relative to the package directory. |


## Setup and installation issues

- **`pnpm install` fails with `ERR_PNPM_UNSUPPORTED_ENGINE`** — The repo sets `engine-strict=true` in `.npmrc`. Install the Node version required by `package.json` `engines.node` (currently `^24.12.0`), or override only for local experiments with `pnpm install --engine-strict=false` (not for CI).
- **`pnpm install` fails for other reasons** — Align Node version with `engines`; delete `node_modules` only at root and retry.
- **`composer install` fails** — Ensure PHP extensions required by root `composer.json` are available.
- **Port already allocated** — Another `wp-env` may be running; run `pnpm wp-env-stop` from the repo root or change the port in the package’s `.wp-env.json`.

If `pnpm check-engines` fails in your environment, file an issue or see [Onboarding validation](./onboarding-validation.md) for tracking.