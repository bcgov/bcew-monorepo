# Release and deployment model

## Source of truth

The **`bcgov/bcew-monorepo`** repository (this monorepo) is the **source of truth** for code, history, and automation. Day-to-day development happens on branches; **releases** are cut from tagged commits.

## How consumers get packages today

1. A maintainer pushes a **namespaced tag** (see [Versioning](./versioning.md)): `<nx-project-name>/v<semver>`.
2. **`tag.yml`** builds the project, attaches **`dist.zip`** to a **GitHub Release** on this repository, and updates the Composer package index **`packages.json`** published to GitHub Pages at `https://bcgov.github.io/bcew-monorepo/`.
3. Downstream WordPress stacks add the Composer **repository** URL and `require` the package by name and version.

The `packages.json` entries point `dist.url` at the release asset on **this** GitHub repo (`update-packages.php` uses `github.com/<repository>/releases/download/...`).

## Release flow (high level)

1. Developers merge work to `main` via pull request.
2. A maintainer pushes a **namespaced version tag** for the Nx project being released.
3. **`tag.yml`** builds that project, publishes **`dist.zip`** on a GitHub Release, and updates **`packages.json`** on GitHub Pages.

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
