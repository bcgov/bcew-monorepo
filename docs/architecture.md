# Monorepo architecture

The BCEW monorepo contains WordPress themes, plugins, shared packages, development tooling, documentation, and automation in one Git repository.

## Architecture goals

The monorepo supports:

- **Shared tooling** through common build, lint, test, and release configuration.
- **Consistent projects** through root configuration and Nx target defaults.
- **Dependency awareness** through the Nx project graph.
- **Central dependency management** through pnpm workspaces and Composer.
- **Independent releases** through project-specific version tags and release archives.
- **Preserved history** when standalone repositories are imported with `nx import`.

## Repository structure

| Path | Purpose |
| --- | --- |
| `plugins/` | WordPress plugins managed as Nx projects and workspace packages. |
| `themes/` | WordPress themes managed as Nx projects and workspace packages. |
| `packages/` | Shared libraries and configuration used by projects. |
| `tools/` | Monorepo tooling, Nx generators, scripts, and documentation synchronization. |
| `docs/` | VitePress documentation source and generated package documentation. |
| `.github/actions/` | Composite actions shared by GitHub Actions workflows. |
| `.github/workflows/` | Pull request, testing, release, and documentation workflows. |

Plugins and themes generally contain:

- `project.json` for Nx project configuration
- `package.json` for JavaScript dependencies and scripts
- `composer.json` for PHP dependencies and package metadata
- `.wp-env.json` for the local WordPress environment
- `docs/` for package documentation

A project only implements the Nx targets it requires.

## Nx project graph

Nx is the monorepo task runner and project graph.

Each project defines its name, location, targets, and project relationships in `project.json`. Shared target behaviour is defined in `nx.json`.

List the projects registered with Nx:

```bash
npx nx show projects
```

View the project graph:

```bash
npx nx graph
```

List projects affected by the current changes:

```bash
npx nx show projects --affected
```

Pull request workflows use Nx affected-project detection so applicable build and test targets run for changed projects and their dependants.

## Project dependencies

Project relationships determine build order and affected-project detection.

### Target dependencies

Targets can use `dependsOn` to run a target in related projects first. For example, `^build` instructs Nx to build project dependencies before building the current project.

### Implicit dependencies

Use `implicitDependencies` when a project depends on another monorepo project but Nx cannot infer that relationship from package metadata.

These relationships ensure that changes to a shared project mark its dependants as affected.

### WordPress runtime dependencies

WordPress dependencies must also be represented in the files used by the relevant tools.

For example, a child theme can identify its parent through:

- the `Template` header in `style.css`
- `.wp-env.json` for the local WordPress environment
- `project.json` for Nx dependency and build relationships
- `composer.json` when the dependency is installed through Composer

A plugin needed by a theme or another plugin may require the same alignment across `.wp-env.json`, Nx project relationships, and Composer configuration.

## JavaScript package management

The monorepo uses pnpm workspaces defined in `pnpm-workspace.yaml`.

Workspace locations include:

```text
themes/*
plugins/*
packages/*
tools/*
```

Run pnpm installation commands from the monorepo root:

```bash
pnpm install
```

The root `pnpm-lock.yaml` records the resolved JavaScript dependency graph for the workspace.

### Dependency rules

- Every project must declare the packages it imports in its own `package.json`.
- Do not rely on a dependency being available only because another workspace package installed it.
- Use `workspace:*` for dependencies on internal workspace packages when applicable.
- Run `pnpm install` from the monorepo root rather than separately inside each project.
- Update and commit `pnpm-lock.yaml` when dependency resolution changes.

## PHP package management

The monorepo uses Composer for PHP tooling, project dependencies, and distribution of released WordPress plugins and themes.

There are two distinct Composer use cases:

1. **Development dependencies** used inside the monorepo.
2. **Released packages** installed by downstream WordPress applications.

## Composer development dependencies

Run the root Composer installation for monorepo-level PHP tooling:

```bash
composer install
```

Install project-level Composer dependencies through the monorepo command:

```bash
pnpm composer-install
```

To install dependencies for one Nx project:

```bash
npx nx run <project-name>:composer-install
```

### Composer path repositories

Projects can consume shared PHP packages from the monorepo using a Composer path repository.

```json
{
  "repositories": [
    {
      "type": "path",
      "url": "../../packages/phpunit-config",
      "options": {
        "symlink": false
      }
    }
  ]
}
```

The path is relative to the `composer.json` that declares it.

Path repositories support local development. They are separate from the public Composer repository used to distribute released plugins and themes.

### Composer lockfiles

- The root `composer.lock` records resolved dependencies for root PHP tooling.
- Project-level lockfiles follow the repository's current package policy.
- Do not add or remove a project-level `composer.lock` without confirming how that project's dependencies are installed in development and CI.

## Composer package distribution

Released BCEW plugins and themes are distributed through a Composer repository published at:

```text
https://bcgov.github.io/bcew-monorepo
```

The repository exposes a `packages.json` index containing the available package names, versions, package metadata, and release archive locations.

Composer uses this index to find a compatible release and download its ZIP archive from the BCEW monorepo's GitHub Releases.

### Distribution flow

The release and installation flow is:

1. A maintainer runs the release workflow for an Nx project.
2. Nx Release creates the project's version and namespaced Git tag.
3. The project is built and packaged as a ZIP archive.
4. A GitHub Release is created and the ZIP is attached.
5. The release metadata is added to `packages.json`.
6. The updated `packages.json` is published to GitHub Pages.
7. A downstream WordPress application runs Composer.
8. Composer reads the BCEW package index, selects a compatible version, and downloads the release ZIP.
9. Composer installs the package according to its declared WordPress package type and the consuming application's Composer configuration.

### Package names and types

BCEW packages use Composer names such as:

```text
bcgov-plugin/bcew-blocks
bcgov-plugin/bcew-chefs-embed
bcgov-plugin/bcew-document-repository
bcgov-plugin/bcew-plugin
bcgov-plugin/bcew-search
bcgov-theme/bcew-belleville-terminal
bcgov-theme/bcew-firb
bcgov-theme/bcew-hporoo
bcgov-theme/bcew-theme
bcgov-theme/bcew-theme-2
bcgov-theme/bcew-ticorp
```

Plugins declare:

```json
"type": "wordpress-plugin"
```

Themes declare:

```json
"type": "wordpress-theme"
```

The package name in a consuming application's `require` section must exactly match the `name` published in `packages.json`.

### Release tags

Release tags identify both the Nx project and version:

```text
<nx-project-name>/v<semver>
```

Examples:

```text
bcew-blocks/v1.0.0
bcew-search/v1.3.1-alpha.0
```

The Nx project name used in the tag is not the same identifier as the Composer package name.

For example:

| Identifier | Value |
| --- | --- |
| Nx project | `bcew-blocks` |
| Git tag | `bcew-blocks/v1.0.0` |
| Composer package | `bcgov-plugin/bcew-blocks` |
| Composer version | `1.0.0` |

## The Composer package index

`packages.json` is an index of all published Composer packages and versions.

Its top-level structure is:

```json
{
  "packages": {
    "vendor/package": {
      "1.0.0": {
        "name": "vendor/package",
        "version": "1.0.0",
        "type": "wordpress-plugin",
        "dist": {
          "url": "https://github.com/bcgov/bcew-monorepo/releases/download/project/v1.0.0/project-1.0.0.zip",
          "type": "zip",
          "reference": "project/v1.0.0"
        }
      }
    }
  }
}
```

Each package can contain multiple versions.

### Package metadata

A package version can include:

| Field | Purpose |
| --- | --- |
| `name` | Composer package name used in `require`. |
| `description` | Package description. |
| `type` | Identifies the package as a WordPress plugin or theme. |
| `license` | Package licence. |
| `autoload` | Production PHP namespace mappings. |
| `autoload-dev` | Development and test namespace mappings, when included. |
| `config.platform.php` | PHP platform version used for Composer dependency resolution, when declared. |
| `version` | Published Composer version. |
| `dist` | Download details for the release archive. |
| `source` | Source repository and reference, when included. |

### Distribution metadata

The `dist` object tells Composer where to download the package:

```json
{
  "dist": {
    "url": "https://github.com/bcgov/bcew-monorepo/releases/download/bcew-blocks/v1.0.0/bcew-blocks-1.0.0.zip",
    "type": "zip",
    "reference": "bcew-blocks/v1.0.0"
  }
}
```

Depending on when and how an existing package version was published, `dist.reference` may contain either a namespaced release tag or a Git commit reference. The package index supplied by the repository contains both forms for existing releases.

The `source` object, when present, identifies the Git repository and release reference:

```json
{
  "source": {
    "type": "git",
    "url": "https://github.com/bcgov/bcew-monorepo.git",
    "reference": "bcew-blocks/v1.0.0"
  }
}
```

Composer normally uses the ZIP identified by `dist.url` for installation.

## Configuring a consuming application

A downstream WordPress application must register the Composer repositories it uses.

```json
{
  "repositories": [
    {
      "type": "composer",
      "url": "https://wpackagist.org",
      "only": [
        "wpackagist-plugin/*",
        "wpackagist-theme/*"
      ]
    },
    {
      "type": "composer",
      "url": "https://bcgov.github.io/bcew-monorepo"
    }
  ]
}
```

These repositories provide different package sources:

| Repository | Purpose |
| --- | --- |
| `https://wpackagist.org` | WordPress.org plugins and themes published under the `wpackagist-plugin/*` and `wpackagist-theme/*` namespaces. |
| `https://bcgov.github.io/bcew-monorepo` | Released BCEW plugins and themes from this monorepo. |

The `only` setting limits WPackagist to its WordPress plugin and theme namespaces. This prevents it from being considered for unrelated Composer packages.

## Installing a BCEW package

Add the required package and version constraint to the consuming application's `composer.json`.

Example:

```json
{
  "require": {
    "bcgov-plugin/bcew-blocks": "^1.0"
  }
}
```

Install the package:

```bash
composer install
```

If the requirement was added from the command line:

```bash
composer require bcgov-plugin/bcew-blocks:^1.0
```

Composer then:

1. Reads the configured repositories.
2. Finds `bcgov-plugin/bcew-blocks` in the BCEW `packages.json`.
3. Selects a version allowed by `^1.0`.
4. Downloads the release archive from GitHub Releases.
5. Records the selected version in `composer.lock`.
6. Installs the package using the application's Composer installer configuration.

The package's final installation directory is controlled by the consuming application's Composer configuration for the `wordpress-plugin` or `wordpress-theme` package type.

## Updating a BCEW package

To update one package within the constraint already defined in `composer.json`:

```bash
composer update bcgov-plugin/bcew-blocks
```

Composer checks the BCEW package index and selects the newest compatible version allowed by the existing constraint.

For example:

```json
{
  "require": {
    "bcgov-plugin/bcew-blocks": "^1.0"
  }
}
```

The `^1.0` constraint permits compatible `1.x` releases but does not permit `2.0.0`.

To change the allowed version range, update the requirement:

```bash
composer require bcgov-plugin/bcew-blocks:^2.0
```

Commit both files when dependency resolution changes:

```text
composer.json
composer.lock
```

The lockfile ensures that deployments and other installations use the same resolved package versions.

## Alpha releases

Alpha versions are published in `packages.json` using versions such as:

```text
1.0.0-alpha.0
1.3.1-alpha.0
```

A stable version constraint does not automatically select a prerelease unless Composer's stability configuration and the package constraint allow it.

Request an alpha explicitly when it is needed:

```json
{
  "require": {
    "bcgov-plugin/bcew-search": "1.3.1-alpha.0"
  }
}
```

The consuming application controls whether prereleases are acceptable through its version constraints and Composer stability settings.

## How published packages are updated

Published package metadata is updated by the release workflow, not by manually editing the deployed `packages.json`.

For each release, the workflow:

1. Determines or accepts the project version.
2. Creates the namespaced release tag.
3. Produces the release archive.
4. Creates the GitHub Release.
5. Adds the version to the package's entry in `packages.json`.
6. Republishes the Composer repository to GitHub Pages.

Existing versions remain in the index so consumers can install versions allowed by their Composer constraints and lockfiles.

When a supported release tag is deleted, the tag deletion workflow removes the corresponding release metadata from `packages.json` and republishes the Composer repository.

Deleting release metadata can prevent new installations of that version. Existing installed files are not changed until Composer runs again.

## Package identity changes

Changing a Composer package's `name` creates a different package identity.

For example, changing:

```text
bcgov-plugin/example-old
```

to:

```text
bcgov-plugin/example-new
```

does not redirect existing consumers.

Each consuming application must update its `composer.json` requirement and run Composer to install the new package name.

Project renaming can affect:

- the Nx project name
- the release tag prefix
- the Composer package name
- release workflow project selection
- package documentation
- downstream Composer requirements
