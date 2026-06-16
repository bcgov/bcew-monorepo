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

Reusable workflow `detect-affected-projects.yml` exists for **callable** workflows; it computes affected **app** projects for a given base/head. Keep it in mind if you add new workflows that need the same logic.

## Merges to `main`

- **Docs:** Pushes to `main` that touch `docs/**`, package `docs/**`, sync script, or docs workflow deploy the VitePress site via `deploy-docs.yml` (see [Documentation site](./documentation-site.md)).
- **Releases:** Merging code does **not** by itself publish plugin/theme zip artifacts. Publishing is **tag-driven** (`tag.yml`).

## Tags (`tag.yml`)

On the GitHub repository, navigate to Actions > Release Subproject and Update packages.json > Run workflow. You should see the following options:
![Release workflow options](assets/release-workflow.png)

Manual workflow used to create releases, given the following inputs:

- Branch: Dropdown providing all branches from which this workflow can be run. Sometimes you may want to create a release off of a non-main branch if something must be tested remotely before it can be merged. In these cases, it should always be a prerelease. Most of the time releases will be created off the main branch.
- Project name: Dropdown providing the names of all monorepo projects.
- Version: Text input for the version to be released, eg. `1.0.1-alpha.1`.
- Is prerelease: Boolean input determining if it's a prerelease. A prerelease version has a postfix like `alpha.1`. 

What this workflow does:

1. Updates versions in source, eg. updates `style.css` or `{plugin name}.php` version fields.
2. Generates release notes describing all pull requests merged into the release.
3. Creates a tag using the project name and version provided as inputs, eg. `bcew-project/v1.0.1-alpha.1`.
4. Builds the project and creates a zip of the result, `dist.zip`.
5. Creates a GitHub Release and attaches `dist.zip` as an asset. Sets to prerelease if "is prerelease" input is true.
6. Updates `packages.json` for the Composer repository on GitHub Pages and deploys it.
