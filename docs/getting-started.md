# Getting started

Run the commands below from the **monorepo root** (the directory that contains `package.json` and `pnpm-workspace.yaml`).

## Requirements

- **Node.js** — version in root `package.json` → `engines.node` (currently `^24.12.0`)
- **pnpm** — [installation](https://pnpm.io/installation)
- **PHP** and **Composer** — for PHP lint and PHPUnit-related workflows (versions per team standard; PHP 7.4+ has been used historically)
- **Docker** — for `@wordpress/env` (for example [Rancher Desktop](https://rancherdesktop.io/))

## Clone and install

```bash
git clone https://github.com/bcgov/bcew-monorepo.git
cd bcew-monorepo

pnpm install
composer install
pnpm composer-install
```

Installs root Node tooling, root Composer tooling (PHPCS, and so on), and **per-project** Composer dependencies where configured.

## Build

Build **all** projects that define a `build` target:

```bash
pnpm build
```

Build **one** project:

```bash
npx nx run <project-name>:build
```

List project names:

```bash
npx nx show projects
```

## Local WordPress (`wp-env`)

From a project directory (plugin or theme with `.wp-env.json`):

```bash
npx nx wp-env-start
```

Or use the underlying command from the project root after reading `project.json` targets. If a port is already in use, stop other `wp-env` instances or adjust the port in `.wp-env.json`.

Stop environments (all projects with the target). Safe to run when nothing is running — idle projects are skipped without error:

```bash
pnpm wp-env-stop
```

From a single project directory:

```bash
npx nx wp-env-stop
```

Clean / reset environments (all projects with the target):

```bash
pnpm wp-env-clean
```

## Documentation site

```bash
pnpm docs:dev    # develop with sync + watch
pnpm docs:build  # production build
pnpm docs:preview
```

See [Documentation site](./documentation-site.md) and [Contributing docs](./contributing.md).

## Common issues

- **`pnpm install` fails with `ERR_PNPM_UNSUPPORTED_ENGINE`** — The repo sets `engine-strict=true` in `.npmrc`. Install the Node version required by `package.json` `engines.node` (currently `^24.12.0`), or override only for local experiments with `pnpm install --engine-strict=false` (not for CI).
- **`pnpm install` fails for other reasons** — Align Node version with `engines`; delete `node_modules` only at root and retry.
- **`composer install` fails** — Ensure PHP extensions required by root `composer.json` are available.
- **Port already allocated** — Another `wp-env` may be running; run `pnpm wp-env-stop` from the repo root or change the port in the package’s `.wp-env.json`.

If `pnpm check-engines` fails in your environment, file an issue or see [Onboarding validation](./onboarding-validation.md) for tracking.
