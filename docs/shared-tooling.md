# Shared tooling and configuration

## What is centralized at the repository root

These files intentionally live once at the **monorepo root** and apply to all (or most) packages:

| Area | Examples |
| --- | --- |
| **JavaScript / Node** | Root `package.json` scripts, `pnpm-workspace.yaml`, shared `typescript` / `@wordpress/scripts` versions |
| **Linting** | `.eslintrc` (or equivalent), `.stylelintrc`, `.prettierrc.js`, markdown lint config, `phpcs.xml` via Composer at root |
| **Testing** | Shared Playwright setup under `packages/e2e/`, PHPUnit XML in `packages/phpunit-config/` |
| **Git** | Root `.gitignore`; release export rules often use `.gitattributes` per package |

Run **monorepo-wide** checks from the root, for example:

```bash
pnpm lint          # JS, CSS, PHP, MD, package.json (see root package.json)
pnpm build         # all projects with a build target
```

## What stays package-specific

Keep configuration **in the package** when it encodes product behavior:

- **`block.json`**, theme `theme.json`, WordPress templates, and PHP bootstrap files
- **`.wp-env.json`** — port mappings, plugin/theme mappings, and env-specific options
- **`composer.json`** — package name, autoload namespaces, `require` / `require-dev` for that product
- **`project.json`** — which Nx targets the package implements and `implicitDependencies`
- **Playwright specs** under `tests/e2e/`, `tests/accessibility/`, and `tests/screenshot/` (generator conventions)

## Examples

### Linting

- **JavaScript:** `pnpm lint-js` → `wp-scripts lint-js` using root ESLint config; fix with `pnpm fix-js`.
- **CSS/SCSS:** `pnpm lint-css` → `wp-scripts lint-style`; fix with `pnpm fix-css`.
- **PHP:** `pnpm lint-php` → root Composer `lint-php` (PHPCS); fix with `pnpm fix-php`.
- **Markdown:** `pnpm lint-md` for docs; `pnpm fix-md` for autofix.

### Testing

- **Playwright configuration:** `packages/e2e/playwright.config.js` defines the `e2e`, `accessibility`, and `screenshot` projects. Each plugin/theme `playwright.config.js` reuses this shared configuration; put specs in the matching `tests/` subdirectory.
- **E2E:** `npx nx run <project>:test-e2e` runs the `e2e` project; `npx nx run <project>:test-e2e-docker` runs it in the Playwright container. Both depend on `wp-env-start` and upstream `build` per `nx.json`.
- **Accessibility:** `npx nx run <project>:test-accessibility` runs the `accessibility` project.
- **Screenshot regression:** `npx nx run <project>:test-screenshot` compares against committed screenshots; `npx nx run <project>:test-screenshot-generate` regenerates them.
- **PHP integration:** `npx nx run <project>:test-integration` runs PHPUnit inside `wp-env` using shared config from `packages/phpunit-config`.

### Build

- **Production assets:** `npx nx run <project>:build` → `wp-scripts build`, output typically `dist/`.

## Migration expectation: remove redundant configuration

When importing a standalone repository:

- Delete duplicate lint configs, per-repo GitHub Actions, and redundant Prettier/Stylelint files **unless** the monorepo root cannot express a needed exception.
- If a one-off rule is required, prefer the **smallest local override** documented in a comment or package readme rather than forking entire configs.

## Documentation site tooling

The docs portal uses **VitePress** and a sync script (`tools/sync-docs.mjs`). Package docs remain in `plugins/<slug>/docs/` and `themes/<slug>/docs/`. See [Documentation site](./documentation-site.md).
