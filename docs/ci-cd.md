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
    2. **e2e** — The `e2e` project from the shared Playwright config, running in the Playwright container with wp-env.
    3. **Screenshot** — The `screenshot` project from the shared Playwright config, running visual regression tests against committed screenshots.
        - If a screenshot test fails, inspect the uploaded Playwright report artifact. To intentionally update baselines, run `npx nx run <project-name>:test-screenshot-generate` for the affected project.
6. **Artifacts** — Playwright report uploaded on completion (unless cancelled).

### How “affected” is chosen

The PR workflow compares the PR head to `origin/<github.base_ref>` (the target branch, usually `main`). Any project touched or implied by the Nx graph runs the expensive targets.

## PR title (`pr-title.yml`)

The workflow checks whether a PR title follows Conventional Commits when a PR opens, changes, or is updated. Editing a title reruns this check without rerunning lint and tests. **The check does not block merges until a repository admin configures the GitHub settings from DSWP-1264:** enable squash merging only, set the squash commit message default to the PR title, and require `Validate PR title` in the `main` branch ruleset or protection settings. Until then, the check may report failure but is not a required merge gate. See the [PR title cheat sheet](./contributing-workflow.md#pr-title-conventional-commits).

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



## Documentation Deployment

The workflow [`.github/workflows/deploy-docs.yml`](https://github.com/bcgov/bcew-monorepo/blob/main/.github/workflows/deploy-docs.yml) builds the site on pushes to `main` (when docs-related paths change) and deploys the output to the `docs/` folder on the `gh-pages` branch for GitHub Pages.


## Tag format

`tag.yml` creates the tag. It encodes both the **Nx project name** and **semver**:

```text
<nx-project-name>/v<semver>
```

**Rules:**

- `<nx-project-name>` must be the **exact** Nx project name (`npx nx show projects`). Example: `bcew-blocks`. If you rename the project, later tags use the **new** name; do not retag history. See [Renaming a plugin or theme](./renaming-projects.md).
- `<semver>` is prefixed with `v` in the tag. The workflow only creates `X.Y.Z` or `X.Y.Z-alpha.N` (examples: `v1.0.0`, `v1.1.0-alpha.1`). Older shapes such as `v1.1.0-a1` are ignored when the next version is chosen.
- Invalid examples:
    - Wrong project slug not in Nx graph
    - Non-semver suffixes such as `v100-testing-tag` for production consumption

The workflow strips the leading `v` for the version recorded in `packages.json` while keeping the full tag for GitHub Release URLs.

## Branch naming

Use descriptive, lowercase, hyphenated branches:

| Prefix | Use |
| --- | --- |
| `feature/` | New functionality |
| `fix/` or `bugfix/` | Defect fixes |
| `chore/` | Tooling, housekeeping |
| `docs/` | Documentation only |

Examples: `feature/add-hero-block`, `fix/wp-env-port-conflict`.

**Default branch:** `main` — PRs usually target `main`; `nx.json` sets `defaultBase` to `origin/main` for local `nx affected` comparisons.

## WordPress version on release

When **`tag.yml`** releases a project:

1. It chooses the next version from existing `{project}/v*` tags. See [CI/CD](./ci-cd.md).
2. It writes that version into the project's `package.json` and `CHANGELOG.md` and commits those files. Plugin PHP files and theme `style.css` in git are **not** modified.
3. The release zip (`<project>-<version>.zip`) gets the `Version:` header set to that version, including alphas:
   - **Theme** — `Version:` line in `style.css`
   - **Plugin** — `* Version:` line in `<nx-project-name>.php`, or the first PHP file in the project root that contains `Plugin Name:`
4. That header change exists only inside the zip attached to the GitHub Release.

You do not edit the version by hand before a release. The placeholder in source (for example `1.0.0`) can stay as-is.

## Communicating version bumps

- Document breaking changes in package `docs/` or changelog files as agreed by the team.


# Release and deployment model

## Source of truth

The **`bcgov/bcew-monorepo`** repository (this monorepo) is the **source of truth** for code, history, and automation. Day-to-day development happens on branches; **releases** are cut from tagged commits.

## How consumers get packages today

1. A maintainer runs **`tag.yml`** from Actions, picks the project, and leaves **Alpha** ticked or unticks it for a real release. The workflow chooses the version and creates the tag `<nx-project-name>/v<semver>` (see [Versioning](./versioning.md)).
2. **`tag.yml`** commits `package.json` and `CHANGELOG.md`, builds the project, attaches a release zip named **`<project>-<version>.zip`** to a **GitHub Release** on this repository, and updates the Composer package index **`packages.json`** published to GitHub Pages at `https://bcgov.github.io/bcew-monorepo/`.
3. Downstream WordPress stacks add the Composer **repository** URL and `require` the package by name and version.

The `packages.json` entries point `dist.url` at the release asset on **this** GitHub repo (`update-packages.php` uses `github.com/<repository>/releases/download/...`).

### Manual vs automated steps

| Step | Usually |
| --- | --- |
| Code review and merge | Manual |
| Choosing the project, the branch, and whether it is an alpha | Manual (maintainer) |
| Version, tag, `package.json` and changelog commit, build, zip, GitHub Release, `packages.json` deploy | **Automated** in `tag.yml` |

## Composer consumer configuration

Example (adjust package name and version):

```json
{
  "repositories": [
    {
      "type": "composer",
      "url": "https://bcgov.github.io/bcew-monorepo"
    }
  ],
  "require": {
    "bcgov-plugin/bcew-blocks": "^1.0"
  }
}
```

Renaming a project's Composer `"name"` publishes a **new** package. Downstream `require` lines must change; old names do not redirect. See [Renaming a plugin or theme](./renaming-projects.md).
