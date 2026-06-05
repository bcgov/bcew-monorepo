# Workflows

Workflow files in this directory implement CI, releases, and documentation deployment for the monorepo. High-level behavior is also described in the published docs: [CI/CD](https://bcgov.github.io/bcew-monorepo/docs/ci-cd) and [Release and deployment](https://bcgov.github.io/bcew-monorepo/docs/release-and-deployment).

## Pull request checks (`pr.yml`)

Runs on every new commit in a PR. Features:

- **Automatic PR labeling** — `actions/labeler` sets labels from `.github/labeler.yml`. When a new plugin or theme is added under `plugins/` or `themes/`, update the labeler rules.
- **Affected projects** — Changed files are analyzed with **`nx affected`** (base = target branch, usually `origin/main`). Only affected projects run `build`, `test-e2e`, and `test-integration`.
- **Lint** — Full monorepo lint (PHP, JS, CSS, Markdown, `package.json`) runs on every PR.

## Tag and release (`tag.yml`)

Runs when a tag matching `**/v*` is pushed (for example `bcew-blocks/v1.1.0`).

- Creates a GitHub Release and attaches `dist.zip` built from the tagged project.
- Updates `packages.json` for the Composer repository on GitHub Pages and deploys it.

See `tag.yml` for exact permissions and steps.

## Deploy documentation site (`deploy-docs.yml`)

Builds the VitePress documentation site (including `tools/sync-docs.mjs`) and deploys output to the `docs/` directory on branch `gh-pages` for GitHub Pages.

**Triggers:** `workflow_dispatch`, pushes to `main` that touch docs-related paths, and PRs that touch those paths (build only; deploy runs on non-PR events).

## Detect affected projects (`detect-affected-projects.yml`)

Reusable workflow (`workflow_call`) that outputs affected **application** projects for a given base/head. Use when adding new automation that should mirror PR semantics.
