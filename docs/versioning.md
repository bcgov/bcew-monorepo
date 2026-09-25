# Tagging and versioning conventions

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
