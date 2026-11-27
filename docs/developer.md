# Developer Documentation

## Getting Started

Run the commands below from the **monorepo root** (the directory that contains `package.json` and `pnpm-workspace.yaml`).



### Clone and Install

```bash
git clone https://github.com/bcgov/bcew-monorepo.git
cd bcew-monorepo

# Installs all of the node packages.
pnpm install

# Runs all the project level builds
pnpm build

# Runs the root composer install.
composer install

# Runs all the project level composer install.
pnpm composer-install
```

## Developer Commands

```bash
# if nx is not installed globally all nx commands to to be `pnpm nx` otherwise just nx
cd bcew-monorepo
pnpm build # builds all plugins and themes
pnpm lint-php # lints all php files in monorepo
pnpm wp-env-stop # stops all docker contains

# using generators `nx generate monorepo:{plugin|theme|block}`
nx generate monorepo:plugin
# This asks questions about the plugin.
cd plugins/my-plugin

# Common commands used for development
# runs the wordpress env, there should be a link with a port number, one for dev, and one for testing
# this automatically does a build
nx wp-env-start
# same and npm run start
nx start
nx build

# testing
nx test-e2e
nx test-accessibility 
nx test-integration
nx test-screenshot
nx test-screenshot-generate

# stops the docker containers
nx wp-env-stop

# back to the root, as these commands can only be run globally
cd ../../ 
pnpm fix-js
pnpm lint-js
pnpm fix-js
pnpm lint-php
pnpm fix-html
pnpm lint-pkg-json

# does lint of js, css, md, package.json, lint-template
pnpm lint

```

## Documentation Site

The monorepo publishes a **single static documentation site** built with [VitePress](https://vitepress.dev/). VitePress is the Vue-team-maintained documentation tool (Vite-based) used for this repository’s docs portal. 

- **Published site:** [https://bcgov.github.io/bcew-monorepo/docs/](https://bcgov.github.io/bcew-monorepo/docs/)
- **Source:** `docs/` at the monorepo root, plus synced content under `docs/content/` (generated)

### Plugin and Theme Structure

```text
{plugins|themes}/{slug}docs/
  index.md
  user-docs.md
  user/
    getting-started.md
  developer-docs.md
  developer/
    local-development.md
```

### Documentation Development

```bash
# from the monorepo root:
cd bcew-monorepo
pnpm install
pnpm docs:dev
```

Mermaid diagrams are supported in Markdown with fenced `mermaid` code blocks.
They render in the browser and adapt to the active light or dark theme.

## Generators

Scaffold new work with the internal Nx plugin:

- **Theme:** `npx nx generate monorepo:theme` then `pnpm install`
- **Plugin:** `npx nx generate monorepo:plugin` then `pnpm install`
- **Block in existing plugin:** `npx nx generate monorepo:block <plugin> <block-name>`

## Contributing

### Pull request titles

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
`type(optional-scope): description`

Use `!` for breaking changes:
`feat!: description`
`feat(scope)!: description`
Squash commits use the PR title, so `BREAKING CHANGE:` in the PR description is not included.

| Type | Use for |
| --- | --- |
| `feat` | New features |
| `fix` | Bug fixes |
| `perf` | Performance improvements |
| `revert` | Reverts |
| `docs` | Documentation |
| `style` | Formatting or style |
| `refactor` | Code restructuring without behaviour changes |
| `test` | Tests |
| `build` | Build system or dependencies |
| `ci` | CI configuration |
| `chore` | Maintenance |



## Requirements

- **Node.js** — version in root `package.json` → `engines.node` (currently `^24.12.0`)
- **pnpm** — [installation](https://pnpm.io/installation)
- **PHP** and **Composer** — for PHP lint and PHPUnit-related workflows (versions per team standard; PHP 7.4+ has been used historically)
- **Docker** — for `@wordpress/env` (for example [Rancher Desktop](https://rancherdesktop.io/))
  

