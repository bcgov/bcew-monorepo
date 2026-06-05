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

**Triggers:** Push of tags matching `**/v*` (for example `bcgov-wordpress-blocks/v1.2.0`).

**Behavior (high level):**

1. Checkout with full history.
2. Parse tag into **project name** (Nx project) and **version**.
3. `nx run <project>:composer-install` and `nx run <project>:build`.
4. Create `dist.zip` from the project directory using `git archive` after staging `dist/` (respects `.gitattributes` export rules).
5. Create a **GitHub Release** with `dist.zip` attached.
6. Update **`packages.json`** for the Composer repository hosted on GitHub Pages and deploy the `public/` output.

See [Release and deployment](./release-and-deployment.md) for the consumer-facing model.

## Permissions

Workflows use least privilege where possible; `tag.yml` and docs deploy require `contents: write` (and Pages-related permissions) for releases and `gh-pages` updates.
