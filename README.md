# WordPress Monorepo

This repository contains WordPress themes and plugins managed within a single Git monorepo.
The primary goals are consistency, shared tooling, and safer long-term maintenance while preserving historical context.

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
npx nx generate monorepo-plugin:theme-generator
pnpm install
```

Follow the on-screen instructions to generate a standalone or child theme that adheres to the current theme standards.

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

#### Manual steps

##### 1. Pre-step: Freeze Development

Before starting the migration:

- Announce a **temporary development freeze** for the repository being migrated
- Ensure all open feature branches are merged or closed
- Publish any final releases that must remain in the original repository

---

##### 2. Clone the Existing Repository

Create a fresh clone that will be rewritten:

```bash
git clone git@github.com:bcgov/example-theme.git
cd example-theme
```

---

##### 3. Rewrite History into the Monorepo Structure

Move the entire repository history so it appears to have always lived under the monorepo path.

```bash
git filter-repo --to-subdirectory-filter themes/example-theme
```

---

##### 4. Rename Existing Tags

Rename tags to avoid collisions with other packages in the monorepo.

> TODO: Finalize naming convention  
> Default: `themes/<theme-slug>/`

```bash
git filter-repo --tag-rename '':'themes/example-theme/'
```

---

##### 5. Merge the Rewritten Repository into the Monorepo

Assuming the following directory structure:

```text
clones/
└─ example-theme/
wordpress-monorepo/
```

From the monorepo root:

```bash
git remote add example-theme ../clones/example-theme
git fetch example-theme
git merge --allow-unrelated-histories example-theme/main
```

After the merge, the monorepo should contain:

```text
themes/
└─ example-theme/
```

---

##### 6. Verify History Preservation

Confirm that commit history and blame information are intact.

```bash
git log --oneline --graph
git log -- themes/example-theme
git blame themes/example-theme/README.md
```

---

##### 7. Additional Branches

Branches other than `main` may be recreated for historical reference.

> ⚠️ Do not merge release branches into monorepo `main`.

```bash
git checkout -b themes/example-theme/release-1.1.0 example-theme/release/1.1.0
git push origin themes/example-theme/release-1.1.0
```

---

##### 8. Pushing Tags

Review tags locally:

```bash
git tag
```

If all tags are properly scoped and approved, then push them to the remote:

```bash
git push origin --tags
```

**Naming requirements**:

- Raw branch names like `release/1.1.0` are **not allowed**
- All legacy branches must be namespaced:
  - `themes/example-theme/release-x.x.x`
  - `plugins/example-plugin/release-x.x.x`

---

##### 9. Cleanup

```bash
git remote remove example-theme
```

---

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
npm install
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
