# Tagging and versioning conventions

## Tag format

Release tags must match the workflow filter in `tag.yml` (`**/v*`) and encode both the **Nx project name** and **semver**:

```text
<nx-project-name>/v<semver>
```

**Rules:**

- `<nx-project-name>` must be the **exact** Nx project name (`npx nx show projects`). Example: `bcew-blocks`. If you rename the project, later tags use the **new** name; do not retag history. See [Renaming a plugin or theme](./renaming-projects.md).
- `<semver>` is prefixed with `v` in the tag. Examples: `v1.0.0`, `v1.1.0-a1` (Composer-compatible prerelease segments are allowed when `tag.yml` and Composer both accept them).
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

When **`tag.yml`** runs for a tag like `bcew-theme-2/v1.4.0`:

1. The workflow parses the tag into project name (`bcew-theme-2`) and version (`1.4.0`).
2. Source files in the repository are **not** modified.
3. **Only if the version is `X.Y.Z`** (three numbers, e.g. `1.2.3`), the release zip (`<project>-<version>.zip`) gets the version field updated:
   - **Theme** — `Version:` line in `style.css`
   - **Plugin** — `* Version:` line in `<nx-project-name>.php`
4. That updated file exists only inside the release zip attached to the GitHub Release.

Tags with other version shapes (for example `1.2.3-beta.1` or `0.0.1-test`) still release, but skip the version update step.

You do not need to edit the version by hand before tagging for `X.Y.Z` releases. The placeholder in source (e.g. `1.0.0`) can stay as-is.

## Communicating version bumps

- Document breaking changes in package `docs/` or changelog files as agreed by the team.
