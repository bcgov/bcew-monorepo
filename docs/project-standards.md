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



   Root shortcuts such as `pnpm build` run `nx run-many` across all projects that define the target.

   Playwright test suites are projects in the shared `packages/e2e/playwright.config.js`; package-level `playwright.config.js` files reuse that configuration. Use the corresponding Nx target to select `e2e`, `accessibility`, or `screenshot`.

5. **Local environment**
   - `.wp-env.json` at the project root when using `wp-env`, consistent with generator output.

6. **Documentation**
   - For sidebar inclusion in the published docs site, add `docs/index.md` under the package. Optional pages are additional Markdown files in the same `docs/` folder. See [Contributing docs](./contributing.md).

7. **Release packaging**
   - A `.gitattributes` containing the standard `export-ignore` list, enforced by `pnpm lint-gitattributes`. See [Shared tooling](./shared-tooling.md#release-packaging-with-gitattributes).

## Shared libraries (`packages/`)

Libraries (for example `packages/phpunit-config`) use a minimal `project.json` and supply Composer or npm metadata as needed. They are referenced by path from application `composer.json` files when appropriate.



See the [monorepo README](https://github.com/bcgov/bcew-monorepo/blob/main/tools/monorepo/README.md) for details.

## Labeler configuration

When adding a new top-level plugin or theme folder, update [`.github/labeler.yml`](https://github.com/bcgov/bcew-monorepo/blob/main/.github/labeler.yml) so pull requests receive accurate area labels.

When **renaming** an existing plugin or theme (folder slug, Nx name, Composer name), follow [Renaming a plugin or theme](./renaming-projects.md) instead of only editing `project.json`.
