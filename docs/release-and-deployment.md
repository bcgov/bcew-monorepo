# Release and deployment model

## Source of truth

The **`bcgov/bcew-monorepo`** repository (this monorepo) is the **source of truth** for code, history, and automation. Day-to-day development happens on branches; **releases** are cut from tagged commits.

## How consumers get packages today

1. A maintainer triggers the release workflow, providing a **namespaced tag** (see [Versioning](./versioning.md)) as an input: `<nx-project-name>/v<semver>`.
2. **`tag.yml`** builds the project, attaches a release zip named **`<project>-<version>.zip`** to a **GitHub Release** on this repository, and updates the Composer package index **`packages.json`** published to GitHub Pages at `https://bcgov.github.io/bcew-monorepo/`.
3. Downstream WordPress stacks add the Composer **repository** URL and `require` the package by name and version.

The `packages.json` entries point `dist.url` at the release asset on **this** GitHub repo (`update-packages.php` uses `github.com/<repository>/releases/download/...`).

### Manual vs automated steps

| Step | Usually |
| --- | --- |
| Code review and merge | Manual |
| Choosing version and pushing tag | Manual (maintainer) |
| Build, zip, GitHub Release, `packages.json` deploy | **Automated** in `tag.yml` |

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
