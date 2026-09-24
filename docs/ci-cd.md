# CI/CD and workflow behavior

All workflows live under [`.github/workflows/`](https://github.com/bcgov/bcew-monorepo/tree/main/.github/workflows). This page summarizes behavior; inline workflow comments and the [workflows README](https://github.com/bcgov/bcew-monorepo/blob/main/.github/workflows/README.md) are authoritative for details.

## Pull requests (`pr.yml`)

**Triggers:** Every `pull_request` event.

**Concurrency:** One run per PR; newer commits cancel in-progress runs for that PR.

**Typical steps:**

1. **Labeler** — Applies labels from `.github/labeler.yml` based on changed paths.
2. **Install** — pnpm and Node (see workflow for versions), `pnpm install`, root `composer install`.
3. **Lint** — Full monorepo lint: PHP, JS, CSS, Markdown, `package.json`.
4. **Build** — `npx nx affected --base="origin/<base_branch>" -t build` so only **affected** projects build.
5. **Tests**:
    1. **Integration** — PHP WordPress integration tests using wp-env.
    2. **e2e** — e2e tests using Playwright and wp-env.
    3. **Screenshot** — Visual regression tests using Playwright and wp-env. Compares screenshots
        - **Note**: If a screenshot test fails in the CI/CD, check the artifact it uploads during the `actions/upload-artifact` step. It will contain a zip of the diff between the expected screenshots and the ones it produced. Usually the fix for this will require running `npx nx test-screenshot-generate` locally to generate new screenshots.
6. **Artifacts** — Playwright report uploaded on completion (unless cancelled).

### How “affected” is chosen

The PR workflow compares the PR head to `origin/<github.base_ref>` (the target branch, usually `main`). Any project touched or implied by the Nx graph runs the expensive targets.

## Merges to `main`

- **Docs:** Pushes to `main` that touch `docs/**`, package `docs/**`, sync script, or docs workflow deploy the VitePress site via `deploy-docs.yml` (see [Documentation site](./documentation-site.md)).
- **Releases:** Merging code does **not** by itself publish plugin/theme zip artifacts. A maintainer starts **`tag.yml`** from Actions. That workflow creates the tag.

## Tags (`tag.yml`)

On the GitHub repository, navigate to Actions > Release Subproject and Update packages.json > Run workflow.

You do not type a version. The workflow reads existing `{project}/v*` tags and picks the next one.

Inputs:

- **Use workflow from:** the branch to release. A release from a branch other than `main` should stay an alpha. Most releases run from `main`.
- **Project to release:** dropdown of monorepo projects. This list is **hardcoded** in `tag.yml` (`workflow_dispatch.inputs.name.options`). When you [rename a project](./renaming-projects.md), add the new Nx name here or you cannot cut a release.
- **Alpha:** ticked by default. Leave it ticked for an alpha. Untick it for a real release.

How the next version is chosen:

- A project with no `{project}/v*` tags starts at `1.0.0-alpha.1` (or `1.0.0` if Alpha is unticked).
- Alphas count up on the same `X.Y.Z` (`1.0.0-alpha.1`, then `1.0.0-alpha.2`).
- Unticking Alpha ships that `X.Y.Z` when it is not tagged yet.
- After a real release, the next series is the next minor (`1.0.0` → `1.1.0` or `1.1.0-alpha.1`). Patch and major are not bumped.
- Tags that are not `X.Y.Z` or `X.Y.Z-alpha.N` (for example `1.1.0-a1`) are ignored.

What this workflow does:

1. Nx Release writes that version into the project's `package.json` and `CHANGELOG.md`, commits those files, and tags `{project}/v{version}` (for example `bcew-blocks/v1.0.0-alpha.1`).
2. Plugin PHP files and theme `style.css` in git are not edited.
3. Builds the project and creates a zip named `<project>-<version>.zip` (for example `bcew-blocks-1.0.0-alpha.1.zip`). The zip's `Version:` header is set to that version, including alphas.
4. Creates a GitHub Release from the changelog and attaches the zip. An alpha version is published as a prerelease.
5. Updates `packages.json` for the Composer repository on GitHub Pages and deploys it.
