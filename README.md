# WordPress Monorepo

This repository contains WordPress themes and plugins managed within a single Git monorepo.
The primary goals are consistency, shared tooling, and safer long-term maintenance while preserving historical context.

## Installation

[pnpm](https://pnpm.io/installation) is the required package manager for this repository. To install:

```shell
npm install -g pnpm
```

## Nx

This repository uses `nx` for various monorepo-related tasks:

1. Calculating project graph and affected projects
   - A project dependency graph is automatically calculated by `nx`, for example, child themes would be dependent on their parent theme such that any change to the parent theme code causes its child themes to have the build/test pipeline run on them (see `.github/workflows/`). We can use the `nx show projects --affected` command to get the list of projects affected by changes in the current branch.
2. Task orchestration and caching
   - Tasks (eg. `npm` scripts) can be run easily for many projects using commands like `nx run-many -t build` which will cause all projects with an `npm` `build` script to run in parallel. Results of the above command will also be cached and stored in `.nx/cache` so that if the same command is run again without changes to the underlying source files, the command will finish immediately using the cached result.
3. Repository importing
   - The process of importing a new plugin or theme into the monorepo can be done using the `nx import` command, given a repository and a monorepo path.
4. Release process (eventually)
   - The process of releasing a version of a plugin or theme may be able to be automated using the `nx release` command. More research is needed to determine how this might work.

See the [nx documentation](https://nx.dev/docs/getting-started/intro) for more information.

### Generating a new theme

Using the `nx generator` feature, we can easily create a new theme in the monorepo using the command:

```shell
npx nx generate monorepo-plugin:theme
pnpm install
```

Follow the on-screen instructions to generate a standalone or child theme that adheres to the current theme standards.

---

### Generating a new WordPress Block plugin

From the monorepo root, run the plugin generator and then install dependencies:

```shell
npx nx generate monorepo-plugin:plugin
pnpm install
```

During generation, the CLI will prompt for the plugin name and, optionally, a description.
Use those prompts to configure the plugin you want to scaffold.

The generator creates a new Block Plugin that follows the current monorepo plugin standards.

If `wp-env start` fails with `port is already allocated` (for example `8888`), run:

```shell
pnpm run wp-env:cleanup
```

### Syncing to mirror repos

In order for the syncing to the mirror repos (standalone, readonly theme or plugin repositories) to work correctly for testing on the test server or performing releases, we need to add authentication for a bot user to be allowed to push to those repos. This involves:

1. Create the mirror repo if it doesn't exist already.
2. Set up branch protection rules to disallow commits from any user other than the bot user that will be pushing to it. It's not intended for users to make any changes to the mirror repos.
   1. See settings on the [Belleville Terminal repository](https://github.com/bcgov/design-system-wordpress-child-theme-belleville-terminal) for an example.
3. Update the [Personal Access Token](https://github.com/settings/personal-access-tokens) to add the new mirror repo under `Repository access` > `Only select repositories`.
   1. Note that the PAT is what is stored in the monorepo's `PUBLISH_REPO_TOKEN`. If we change which user's PAT we want to use for authentication, we must update this secret with the new token.

---

## Contributing

### Adding an Existing Repository to the Monorepo

The example below assumes you are adding a theme and uses `example-theme` as a placeholder for the existing repository name.

> ⚠️ **Important**
> This process rewrites Git history. **Do not run it directly on the original repository.**

---

### Migration Process

#### Nx steps

##### 1. Run nx import command

```bash
npx nx import <git repo url> <destination path>
```

Then follow the on-screen wizard to finish the import.

Example:

```bash
npx nx import https://github.com/bcgov/design-system-wordpress-theme themes/design-system-wordpress-theme
```

---

#### Updating migrated plugins/themes to monorepo standard

1. Temporarily rename the directory of the new project, for example adding a `_` to the beginning.
    - This is so that the next step can run without causing issues with the directory already existing.
1. Run the relevant generator for the project type, for example `npx nx generator monorepo-plugin:theme` (or `monorepo-plugin:plugin`).
1. Provide the values to the generator that match the project, for example if the project's slug is `design-system-child-example`, provide that value to the generator as the slug.
1. Copy the contents of the directory the generator created into the imported project directory (the one we renamed in step 1).
    - We want the files to be overwritten with changes from the generator files.
    - You may need to do this outside of VSCode as it doesn't seem to allow overwriting of files by default.
1. Delete the generator-created directory.
1. Rename the imported directory back to its original name.
1. Go through the files changed using git and individually revert any changes that should not be overwritten, for example plugin/theme version should not be overwritten with the default `1.0.0` set by the generator, any sample files can be deleted.
1. Delete any unnecessary files, like files used for linting. List of files to be delete:
    - .github/
    - dist/
    - .gitignore
    - .markdownlint*
    - CODEOWNERS
    - composer.lock
    - package.lock
1. Commit the above changes.
1. Run all relevant nx targets to ensure they are functioning. See `project.json` for the full list of targets.
1. Run linting to ensure linting passes for the imported project (`pnpm lint`).

## Workflows and CI/CD

> ⚠️ Not yet finalized

Theme- and plugin-level workflows will eventually be replaced by root-level workflows that target packages based on changed paths.

---

## Release Policy (Current Phase)

- This monorepo **does not produce production releases**
- Official releases continue to be cut from original repositories
- Scoped tags and release branches exist for historical reference and future planning

### Release Process

Todo: Determine how to automate release process using nx.

```bash
npx nx release ...
```

---

## Package Management

### npm Workspaces

This repository uses **npm workspaces** to manage JavaScript dependencies across themes and plugins.

```json
{
  "workspaces": ["themes/*", "plugins/*"]
}
```

This configuration:

- Treats each theme and plugin as an independent package
- Hoists compatible dependencies to a shared root `node_modules`
- Enables running scripts across all packages from the repository root

---

### Installing Dependencies

From the repository root:

```bash
pnpm install
```

This installs root tooling and all workspace dependencies. There is no need to run `npm install` inside individual packages.

---

### Workspace Scripts

Example:

```bash
npm run build
```

This runs `build` in each workspace where the script exists, using the workspace directory as the execution context.

---

### Declaring Dependencies

Each theme or plugin must:

- Include its own `package.json`
- Declare all direct dependencies it requires

> ⚠️ Do not rely on implicitly hoisted dependencies.

---

### Plugins or Themes with Multiple Packages

Each directory containing a `package.json` is a separate workspace package and must be explicitly included.

Example:

```json
{
  "workspaces": [
    "themes/*",
    "plugins/example-plugin",
    "plugins/example-plugin/Blocks/*",
    "packages/*"
  ]
}
```

---

### Peer Dependency Resolution

Some tooling (e.g. `@wordpress/scripts`) relies on peer dependencies.

If a workspace script fails with `MODULE_NOT_FOUND`:

1. Identify the missing module
2. Add it to the workspace’s `devDependencies`
3. Re-run `npm install` from the repository root

---

### Script Contract (Draft)

All packages must implement the following npm scripts:

- `build`
- `composer:install`
- If tests exist, `wp-env`, `test:e2e`, etc.

---

## Shared Configuration and Tooling

To reduce duplication and configuration drift, this monorepo centralizes common tooling and configuration files at the repository root wherever possible. Themes and plugins consume these shared configurations rather than maintaining their own copies.

The goal is to keep packages lightweight while enforcing consistent standards across the ecosystem.

---

### What Is Centralized

The following files and directories are intended to live at the **monorepo root** and be reused by all themes and plugins:

#### Linting and Formatting

- `.eslint.*`
- `.markdownlint.*`
- `.prettierrc.js`
- `.stylelintrc`
- `phpcs.xml`

---

#### JavaScript / Build Tooling

- Shared `@wordpress/scripts` expectations
- Common overrides
- Root-level `package.json` scripts
- All linting (PHP, JS, CSS, etc.) is performed via the root `package.json` scripts

Themes and plugins should only add package-local build configuration when they have legitimate, product-specific needs.

---

#### Testing Infrastructure

- PHPUnit configuration
- Playwright configuration (`packages/e2e/playwright.config.js`)
- wp-env configuration (`.wp-env.json`)
- Shared test utilities and bootstrap files (under `packages/e2e/`)

Individual packages may define **minimal wrapper configs** that reference the shared setup.

---

#### Git Ignore

- Root `.gitignore` contains common patterns (e.g., `node_modules`, `vendor`, `build`, `dist` logs)
- Packages keep only project-specific ignores

---

#### GitHub Workflows

- All CI workflows live under `.github/workflows/` at the root - TODO: Migrate from packages
- Workflows target themes/plugins using path filters and workspace execution

As packages are migrated:

- Theme- or plugin-local workflows should be **removed**
- CI behavior is preserved via centralized workflows

---

#### Package-Specific Configuration

- `package.json` (required per package)
- Package-specific scripts
- Dependencies used by that package

---

### Expected Migration Changes

As packages move into the monorepo, it is expected that:

- Redundant config files are deleted from the package
- Package configs are simplified to reference shared root files
- GitHub workflows are removed from the package
- CI behavior is validated via root workflows

---

## pnpm (Experimental)

npm is the supported package manager. `pnpm` may be evaluated experimentally but is not part of the official workflow.

### Constraints

- npm remains the source of truth
- No CI changes
- No script contract changes

### pnpm Workspace Configuration

At the repository root, define workspaces of any package.json files in pnpm-workspace.yaml, e.g.:

```yaml
packages:
  - "themes/*"
  - "plugins/*"
  - "packages/*"
```

### Using pnpm Locally

```bash
brew install pnpm
pnpm install
pnpm -r run build
pnpm --filter example-theme run build
```
