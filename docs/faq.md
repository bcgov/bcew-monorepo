# Frequently asked questions

Common questions about setting up, developing, testing, and contributing to the BCEW monorepo.

## Setup and dependencies

### Why does `pnpm install` fail with `ERR_PNPM_UNSUPPORTED_ENGINE`?

The repository enforces its required Node.js version.

Check `engines.node` in the root `package.json` and install a compatible Node.js version before running:

```bash
pnpm install
```

### What should I do if `pnpm install` fails?

Run installation commands from the monorepo root and confirm that your Node.js version matches the version required by `package.json`.

If you need a clean reinstall while keeping the existing dependency resolution:

```bash
rm -rf node_modules
rm -rf "$(pnpm store path)"
pnpm install --frozen-lockfile
```

Keep `pnpm-lock.yaml` unless you intentionally need to change dependency resolution.

### Where is the pnpm store?

Check the store used by your current environment:

```bash
pnpm store path
```

A `.pnpm-store` directory in the repository does not mean pnpm is using it. The active store is controlled by pnpm configuration.

### Why do I get `Module not found` after adding an import?

Add the dependency to the `package.json` for the package that uses it, then run:

```bash
pnpm install
```

from the monorepo root.

### How should I handle the wrong version of a transitive dependency?

Add the required dependency directly to the package that needs it.

Root pnpm overrides can be used when a dependency must be controlled across the workspace. Coordinate workspace-wide overrides with the team.

### How should I handle peer dependency warnings?

Install the required peer dependency in the package that consumes it and keep shared dependency versions aligned across the workspace.

### How do I resolve duplicate React or WordPress package issues?

Check the root and package `package.json` files and keep shared `@wordpress/*` dependencies aligned across the workspace.

### What should I check when `composer install` fails?

Confirm that your local PHP environment provides the PHP extensions required by `composer.json`.

For Composer path repositories, verify that the configured `url` is correct relative to the `composer.json` that defines it.

## Local WordPress environments

### What should I do when a wp-env port is already allocated?

Another WordPress environment may already be running.

From the monorepo root, stop running environments with:

```bash
pnpm wp-env-stop
```

If required, configure a different port for the project's local environment.

### How can I override wp-env settings locally?

Use:

```text
.wp-env.override.json
```

alongside the project's `.wp-env.json`.

Use the override for machine-specific settings that should not change the shared project configuration.

## Building and testing

### Why do I need to rebuild after checking out another branch?

Build output is not committed to the repository. After switching to or updating a branch, refresh dependencies and rebuild so generated files match that branch:

```bash
pnpm install
pnpm build
```

### How do I build only one project?

From the monorepo root:

```bash
npx nx run <project-name>:build
```

### Why does CI run tests for projects I did not directly change?

Nx determines affected projects from both changed files and the project dependency graph. A change to shared code can therefore affect multiple projects.

### What tests run for a pull request?

The pull request workflow coordinates:

- linting
- JavaScript unit tests
- PHP integration tests
- Playwright end-to-end tests
- accessibility tests
- screenshot tests
- SonarQube analysis

Applicable test workflows use Nx affected-project detection.

### Where do I find Playwright failure information?

Failed Playwright runs upload a project-specific artifact containing available test results, screenshot differences, and traces.

Check the workflow run in GitHub Actions and download the `playwright-report-<project>` artifact for the failed project.

## Screenshot testing

### How do I update screenshot baselines?

Run the **Run Screenshot Generator** workflow from GitHub Actions and select the project.

The workflow runs the project's screenshot-generation target and commits changed snapshots back to the selected branch.

It does not run against `main`.

### Why can't I manually run a new workflow that exists only on my feature branch?

A manually dispatched GitHub Actions workflow must first exist on the repository's default branch.

Once the workflow exists on `main`, choose your feature branch when manually running it.

## Pull requests and CI

### Why was a label automatically added to my pull request?

The pull request workflow uses `.github/labeler.yml` to apply labels based on the files changed.

Labels identify monorepo, plugin, theme, and project-specific changes.

### What format should my pull request title use?

Use Conventional Commits:

```text
type(optional-scope): description
```

For example:

```text
feat(theme): add event filters
```

Supported types are:

- `feat`
- `fix`
- `perf`
- `revert`
- `docs`
- `style`
- `refactor`
- `test`
- `build`
- `ci`
- `chore`

Use `!` before the colon for a breaking change:

```text
feat!: description
```

### Why did changing my PR title rerun validation?

PR title validation is a separate GitHub Actions workflow. Editing the title reruns the title check without requiring the main CI workflow to rerun.

## Releases

### Does merging to `main` create a release?

No. Releases are started manually through the release workflow.

### How do I create a release?

Run **Create a Release** from GitHub Actions and select:

- the project
- whether the release is an alpha
- an optional version

If the version is not supplied, Nx determines the release version.

### What format do release tags use?

```text
<nx-project-name>/v<semver>
```

The project portion must match the Nx project name.

### What does the release workflow publish?

The release workflow:

1. Runs Nx Release.
2. Creates the release tag and GitHub Release.
3. Builds the project release archive.
4. Uploads the ZIP to the GitHub Release.
5. Updates the Composer `packages.json`.
6. Publishes the Composer repository to GitHub Pages.

### What happens if a release tag is deleted?

For a supported release tag, the tag deletion workflow removes its corresponding release metadata from `packages.json` and republishes the Composer repository.

## Documentation

### Where should package documentation go?

Keep documentation with the package it describes:

```text
plugins/<plugin-slug>/docs/
themes/<theme-slug>/docs/
```

### Should I edit `docs/content/`?

No. `docs/content/` is generated output and is replaced when documentation is synchronized.

Edit the source documentation under the appropriate plugin or theme instead.

### How do I preview the documentation site?

From the monorepo root:

```bash
pnpm docs:dev
```

### When is the documentation site deployed?

Documentation-related pull requests build the site without deploying it.

Relevant changes merged to `main` trigger the documentation workflow, which builds and publishes the VitePress site to GitHub Pages.

## Getting more help

If the problem is reproducible and not covered here, open a GitHub bug report with:

- the affected project or area
- a summary of the problem
- expected and actual behaviour
- steps to reproduce
- relevant environment information
- logs, screenshots, or other supporting information
