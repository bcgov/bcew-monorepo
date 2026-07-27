# Workflows

Workflow files in this directory implement CI, releases, and documentation deployment for the monorepo. High-level behavior is also described in the published docs: [CI/CD](https://bcgov.github.io/bcew-monorepo/docs/ci-cd) and [Release and deployment](https://bcgov.github.io/bcew-monorepo/docs/release-and-deployment).

## Pull request checks (`pr.yml`)

Runs on every new commit in a PR. Features:

- **Automatic PR labeling** — `actions/labeler` sets labels from `.github/labeler.yml`. When a new plugin or theme is added under `plugins/` or `themes/`, update the labeler rules.
- **Affected projects** — Changed files are analyzed with **`nx affected`** (base = target branch, usually `origin/main`). Only affected projects run `build`, `test-e2e`, and `test-integration`.
- **Lint** — Full monorepo lint (PHP, JS, CSS, Markdown, `package.json`) runs on every PR.

## Tag and release (`tag.yml`)

Manual workflow used to create releases, given the following inputs:
- Project name: Dropdown providing the names of all monorepo projects.
- Version: Text input for the version to be released, eg. `1.0.1-alpha.1`.
- Is prerelease: Boolean input determining if it's a prerelease. A prerelease version has a postfix like `alpha.1`. 

What this workflow does:
1. Updates versions in source, eg. updates `style.css` or `{plugin name}.php` version fields.
2. Generates release notes describing all pull requests merged into the release.
3. Creates a tag using the project name and version provided as inputs, eg. `bcew-project/v1.0.1-alpha.1`.
4. Builds the project and creates a zip of the result named `<project>-<version>.zip` (for example, `bcew-blocks-1.0.1.zip`).
5. Creates a GitHub Release and attaches that zip as an asset. Sets to prerelease if "is prerelease" input is true.
6. Updates `packages.json` for the Composer repository on GitHub Pages and deploys it.

See `tag.yml` for exact permissions and steps.

## Deploy documentation site (`deploy-docs.yml`)

Builds the VitePress documentation site (including `tools/sync-docs.mjs`) and deploys output to the `docs/` directory on branch `gh-pages` for GitHub Pages.

**Triggers:** `workflow_dispatch`, pushes to `main` that touch docs-related paths, and PRs that touch those paths (build only; deploy runs on non-PR events).
