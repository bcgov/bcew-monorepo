# Workflows

Workflow files in this directory implement CI, releases, and documentation deployment for the monorepo. High-level behavior is also described in the published docs: [CI/CD](https://bcgov.github.io/bcew-monorepo/docs/ci-cd) and [Release and deployment](https://bcgov.github.io/bcew-monorepo/docs/release-and-deployment).

## Pull request checks (`pr.yml`)

Runs on every new commit in a PR. Features:

- **Automatic PR labeling** — `actions/labeler` sets labels from `.github/labeler.yml`. When a new plugin or theme is added under `plugins/` or `themes/`, update the labeler rules.
- **Affected projects** — Changed files are analyzed with **`nx affected`** (base = target branch, usually `origin/main`). Only affected projects run `build`, `test-e2e`, and `test-integration`.
- **Lint** — Full monorepo lint (PHP, JS, CSS, Markdown, `package.json`) runs on every PR.

## Tag and release (`tag.yml`)

Manual workflow. Pick a project. Alpha is ticked by default; untick it for a real release. The version is not typed in. A script reads existing `{project}/v*` tags and applies the house rules (alphas count up on the same `X.Y.Z`; a real release is that `X.Y.Z` if it is missing; after a real release the next series is the next minor).

What this workflow does:
1. Nx Release writes the version into the project's `package.json` and `CHANGELOG.md`, commits those files, and tags `{project}/v{version}`.
2. Plugin PHP files and theme `style.css` in git are not edited.
3. Builds the project and creates a zip named `<project>-<version>.zip`. The zip's `Version:` header is set to that version, including alphas.
4. Creates a GitHub Release from the changelog and attaches the zip. An alpha version is published as a prerelease.
5. Updates `packages.json` for the Composer repository on GitHub Pages and deploys it.

See `tag.yml` for exact permissions and steps.

## Deploy documentation site (`deploy-docs.yml`)

Builds the VitePress documentation site (including `tools/sync-docs.mjs`) and deploys output to the `docs/` directory on branch `gh-pages` for GitHub Pages.

**Triggers:** `workflow_dispatch`, pushes to `main` that touch docs-related paths, and PRs that touch those paths (build only; deploy runs on non-PR events).
