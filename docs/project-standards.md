# Project standards and “valid” packages

A **valid** monorepo package in this repository is a workspace member that Nx can execute targets for and that meets the expectations below. Shipping WordPress plugins and themes live under `plugins/<slug>/` or `themes/<slug>/`.

## Required for application packages (plugins and themes)

1. **`project.json`** (Nx) at the package root
   - Includes a unique `name` matching the Nx project name used in tags (see [Versioning](./versioning.md)).
   - Declares `root`, `projectType: "application"`, and a `targets` object listing the targets this package supports (empty objects inherit defaults from `nx.json`).

2. **`package.json`**
   - Required for `@wordpress/scripts` and workspace tooling.
   - Must declare **its own** runtime and dev dependencies; do not rely on accidental hoisting (see [Package management](./package-management.md)).

3. **`composer.json`** (when PHP / Composer is used)
   - Defines the Composer package name, autoloading, and scripts such as `test` for integration tests.
   - Path repositories to monorepo packages (for example `packages/phpunit-config`) must be explicit where needed.

4. **Targets and scripts**
   Implement the targets your project needs, aligned with [`nx.json` defaults](https://github.com/bcgov/bcew-monorepo/blob/main/nx.json):

   | Target | Typical use |
   | --- | --- |
   | `composer-install` | `composer install` in the project root |
   | `build` | `wp-scripts build` → `dist/` |
   | `start` | `wp-scripts start` (watch) |
   | `wp-env-start` / `wp-env-stop` / `wp-env-clean` | Local WordPress via `@wordpress/env` |
   | `test-e2e` | Playwright via `wp-scripts test-playwright` |
   | `test-integration` | PHPUnit inside `wp-env` |
   | `test-screenshot` | Playwright visual regression tests, comparing with committed screenshots, generally only used by CI/CD. |
   | `test-screenshot-generate` | Generate new Playwright visual regression screenshots, necessary when CI/CD finds mismatch between screenshots. |

   Root shortcuts such as `pnpm build` run `nx run-many` across all projects that define the target.

5. **Local environment**
   - `.wp-env.json` at the project root when using `wp-env`, consistent with generator output.

6. **Documentation**
   - For sidebar inclusion in the published docs site, add `docs/index.md` under the package. Optional pages are additional Markdown files in the same `docs/` folder. See [Contributing docs](./contributing.md).

## Shared libraries (`packages/`)

Libraries (for example `packages/phpunit-config`) use a minimal `project.json` and supply Composer or npm metadata as needed. They are referenced by path from application `composer.json` files when appropriate.

## Generators

Scaffold new work with the internal Nx plugin:

- **Theme:** `npx nx generate monorepo:theme` then `pnpm install`
- **Plugin:** `npx nx generate monorepo:plugin` then `pnpm install`
- **Block in existing plugin:** `npx nx generate monorepo:block <plugin> <block-name>`

See the [monorepo README](https://github.com/bcgov/bcew-monorepo/blob/main/tools/monorepo/README.md) for details.

## Labeler configuration

When adding a new top-level plugin or theme folder, update [`.github/labeler.yml`](https://github.com/bcgov/bcew-monorepo/blob/main/.github/labeler.yml) so pull requests receive accurate area labels.
