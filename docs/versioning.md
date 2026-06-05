# Tagging and versioning conventions

## Tag format

Release tags must match the workflow filter in `tag.yml` (`**/v*`) and encode both the **Nx project name** and **semver**:

```text
<nx-project-name>/v<semver>
```

**Rules:**

- `<nx-project-name>` must be the **exact** Nx project name (`npx nx show projects`). Example: `bcew-blocks`.
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

## Releases and prereleases

`tag.yml` currently marks GitHub Releases as **prerelease** (`prerelease: true` in the workflow). Adjust workflow YAML when the program moves to stable release semantics.

## Communicating version bumps

- Update **package** `version` fields (`package.json`, `readme.txt`, plugin PHP header) as required by your release checklist before tagging.
- Document breaking changes in package `docs/` or changelog files as agreed by the team.
