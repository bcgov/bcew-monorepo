# Monorepo architecture

## Why this monorepo exists

The BC Government BCEW monorepo brings **WordPress themes, plugins, and shared packages** into one Git repository so teams can:

- **Share tooling** — One set of lint, test, and build commands (`@wordpress/scripts`, PHPCS, Playwright, PHPUnit) instead of per-repo copies that drift apart.
- **Enforce consistency** — Root-level configuration and Nx task defaults keep project structure and scripts aligned.
- **Preserve history** — Existing repositories can be imported with Git history intact (`nx import`), so audits and blame remain meaningful after consolidation.
- **Coordinate releases** — Version tags are namespaced per Nx project (`<project-name>/v<semver>`), matching Composer consumption patterns documented in [Release and deployment](./release-and-deployment.md).

## Repository layout

| Path | Purpose |
| --- | --- |
| `plugins/` | WordPress plugins; each shipping plugin is typically one folder with `package.json`, `composer.json`, and `project.json`. |
| `themes/` | WordPress themes; same expectations as plugins for Nx and package metadata. |
| `packages/` | Shared libraries (for example PHPUnit config consumed via Composer path repositories). |
| `tools/` | Internal tooling (for example the `monorepo` Nx plugin and doc sync script). |
| `docs/` | VitePress site source and generated `docs/content/` from package-local docs. |
| `.github/workflows/` | CI/CD workflows (PR checks, tagged releases, docs deploy). |

## Discovering projects (Nx)

**Nx** is the task runner and project graph engine:

- Each **application** (theme or plugin) has a `project.json` at its root declaring the project `name`, `root`, and which **targets** it implements (`build`, `composer-install`, `wp-env-start`, and so on).
- Default target behavior (commands, caching, `dependsOn`) lives in [`nx.json`](https://github.com/bcgov/bcew-monorepo/blob/main/nx.json) under `targetDefaults`.
- **Discover projects:** `npx nx show projects`
- **Graph (local):** `npx nx graph`
- **Affected projects (for a branch):** `npx nx show projects --affected` (compare with `defaultBase`, usually `origin/main`)

Pull request CI uses **`nx affected`** so only changed projects and their graph dependencies run expensive build and test targets.

## Dependency relationships

### Build order (`dependsOn`)

In `nx.json`, the `build` and `start` targets use `"dependsOn": ["^build"]`. That means Nx builds **upstream** projects in the graph first. Any project that should trigger downstream builds must be linked in the graph (for example via `implicitDependencies` or package relationships Nx understands).

### `implicitDependencies`

Projects may list other projects or paths in `implicitDependencies` so changes there mark dependents as affected. Today, generated plugins and themes often include `packages/phpunit-config/` so PHPUnit-related changes surface in CI for those apps.

### WordPress parent and child themes

**Child themes** may depend on a **parent theme** at runtime (WordPress `Template:` header, Composer packages, or shared design tokens). That relationship might live outside this monorepo (for example a parent theme in another repository). Document parent/child links in the child theme’s `readme.txt`, `composer.json`, and package docs. If both parent and child are ever in the same monorepo, add explicit Nx graph edges (for example `implicitDependencies`) so CI builds and tests run in the right order.

## pnpm workspaces

JavaScript dependencies are managed with **pnpm** and **`pnpm-workspace.yaml`**, which includes `themes/*`, `plugins/*`, `packages/*`, and `tools/*`. See [Package management](./package-management.md).


# Package management and dependency rules

## npm / pnpm workspaces

The monorepo uses **pnpm** with workspaces defined in `pnpm-workspace.yaml`:

- `themes/*`
- `plugins/*`
- `packages/*`
- `tools/*`

Root `package.json` also lists `workspaces` for compatibility with tools that read it.

## Hoisting

pnpm installs dependencies into:

- A **root** `node_modules` with symlinks into workspace packages
- **Per-package** `node_modules` where needed for peer dependencies or isolation

**Expectation:** Hoisting reduces duplication, but **you must not rely on implicit hoisting** — a package must **declare every dependency** it imports in its own `package.json`. CI and fresh installs must succeed without “it worked because another package pulled it in.”

## Rules

1. **Declare own dependencies** — If `plugins/my-plugin/src/index.js` imports a package, that package must appear in `plugins/my-plugin/package.json` (`dependencies` or `devDependencies` as appropriate).
2. **Workspace protocol** — Internal packages use `workspace:*` when published through the workspace (for example shared npm packages under `packages/`).
3. **Single install** — Run `pnpm install` **once** at the monorepo root; do not ask contributors to `pnpm install` inside each plugin unless troubleshooting.
4. **Composer** — Run root `composer install` for monorepo PHP tooling; run `pnpm composer-install` (or `nx run <project>:composer-install`) for per-project vendors as needed.

## Composer path repositories

Plugins and themes often reference monorepo libraries via a **path** repository in `composer.json`:

```json
"repositories": [
  {
    "type": "path",
    "url": "../../packages/phpunit-config",
    "options": { "symlink": false }
  }
]
```

Keep relative paths correct for the package’s depth under `plugins/` or `themes/`.


## Lockfiles

- **`pnpm-lock.yaml`** is committed at the root — keep it authoritative for JS.
- **Per-package `composer.lock`** — follow team policy; many migrations remove per-package locks in favor of reproducible installs from `composer.json` constraints. Confirm with maintainers before deleting.
