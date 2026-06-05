# Documentation site

The monorepo publishes a **single static documentation site** built with [VitePress](https://vitepress.dev/). VitePress is the Vue-team-maintained documentation tool (Vite-based) used for this repository’s docs portal. If your organization standardizes on the `vuepress` package specifically, migrating the same Markdown content is possible as a follow-up; the information architecture and sources described here stay the same.

## URLs

- **Published site:** [https://bcgov.github.io/bcew-monorepo/docs/](https://bcgov.github.io/bcew-monorepo/docs/) (base path `/bcew-monorepo/` on GitHub Pages)
- **Source:** `docs/` at the monorepo root, plus synced content under `docs/content/` (generated)

## Local development

From the monorepo root:

```bash
pnpm install
pnpm docs:dev
```

This runs `docs:sync` once, then watches package docs and rebuilds the site. See [Getting started](./getting-started.md) and [Contributing docs](./contributing.md).

## Deployment

The workflow [`.github/workflows/deploy-docs.yml`](https://github.com/bcgov/bcew-monorepo/blob/main/.github/workflows/deploy-docs.yml) builds the site on pushes to `main` (when docs-related paths change) and deploys the output to the `docs/` folder on the `gh-pages` branch for GitHub Pages.

**Ownership:** Contributors who change workflows or docs layout should confirm Pages settings and branch protection with repository administrators.
