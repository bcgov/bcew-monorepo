# Onboarding validation checklist

Use this checklist to confirm the documentation and repo are sufficient for a new developer. Gaps discovered here should be fixed in the same documentation pass or tracked with an explicit owner.

## Environment

- [ ] Node.js version matches root `package.json` `engines.node` (`.npmrc` sets `engine-strict=true`, so `pnpm install` fails if Node is wrong)
- [ ] `pnpm` installed globally
- [ ] PHP and Composer installed for PHP lint and PHPUnit workflows
- [ ] Docker available for `wp-env` (for example Rancher Desktop)

## Clone and install

```bash
git clone https://github.com/bcgov/bcew-monorepo.git
cd bcew-monorepo
pnpm install
composer install
pnpm composer-install
```

- [ ] `pnpm install` completes without errors
- [ ] `composer install` at root completes
- [ ] `pnpm composer-install` installs per-project Composer deps

## Build at least one project

```bash
npx nx run bcew-blocks:build
```

(Or another project name from `npx nx show projects`.)

- [ ] Build succeeds and produces `dist/` (or expected output) for that project

## Docs site locally

```bash
pnpm docs:dev
```

- [ ] Site loads and shows monorepo sections plus any package docs with `docs/index.md`

## Understand workflow

After reading the docs site, a new contributor should be able to answer:

- [ ] Where to add a new plugin or theme and which files are required
- [ ] How PR CI chooses which projects to build
- [ ] How to cut a release (tag format and what `tag.yml` does)
- [ ] Where shared lint configuration lives vs package-specific config

## Known follow-ups

Document any failures here temporarily with **owner** and **issue link**, then remove once resolved:

- `check-engines` — root README historically noted issues; if still failing, track under an issue and link from [Getting started](./getting-started.md).
