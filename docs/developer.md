# Developer Documentation
## Getting started

Run the commands below from the **monorepo root** (the directory that contains `package.json` and `pnpm-workspace.yaml`).



### Clone and install

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

Installs root Node tooling, root Composer tooling (PHPCS, and so on), and **per-project** Composer dependencies where configured.

## Developer Workflows

Build **one** project:

```bash
npx nx run <project-name>:build
```

List project names:

```bash
npx nx show projects
```

### After checking out a branch

Because build artifacts are not committed, run these again whenever you check out or pull a branch (including when reviewing a PR):

```bash
pnpm install
pnpm build
```

See [Contributing workflow](./contributing-workflow.md#after-checking-out-a-branch) for more detail.

### Local WordPress (`wp-env`)

From a project directory (plugin or theme with `.wp-env.json`):

```bash
npx nx wp-env-start
```

Or use the underlying command from the project root after reading `project.json` targets. If a port is already in use, stop other `wp-env` instances or adjust the port in `.wp-env.json`.

Stop environments (all projects with the target). Safe to run when nothing is running — idle projects are skipped without error:

```bash
pnpm wp-env-stop
```

From a single project directory:

```bash
npx nx wp-env-stop
```

Clean / reset environments (all projects with the target):

```bash
pnpm wp-env-clean
```

### Documentation site

```bash
pnpm docs:dev    # develop with sync + watch
pnpm docs:build  # production build
pnpm docs:preview
```

See [Documentation site](./documentation-site.md) and [Contributing docs](./contributing.md).


## Requirements

- **Node.js** — version in root `package.json` → `engines.node` (currently `^24.12.0`)
- **pnpm** — [installation](https://pnpm.io/installation)
- **PHP** and **Composer** — for PHP lint and PHPUnit-related workflows (versions per team standard; PHP 7.4+ has been used historically)
- **Docker** — for `@wordpress/env` (for example [Rancher Desktop](https://rancherdesktop.io/))
  

