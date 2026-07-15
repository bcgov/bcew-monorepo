# BCEW Monorepo

This repository contains WordPress themes and plugins managed in a single Git monorepo. Goals include **shared tooling**, **consistent standards**, **maintainability**, and **preserved history** when importing legacy projects.

## Documentation

**Primary documentation (onboarding, architecture, CI/CD, releases, versioning):**

[https://bcgov.github.io/bcew-monorepo/docs/](https://bcgov.github.io/bcew-monorepo/docs/)

The site is built from the `docs/` folder with **VitePress** (see [Documentation site](docs/documentation-site.md)). Package-level docs live under `plugins/<slug>/docs/` and `themes/<slug>/docs/` and are synced into the site before build.

### Quick start

**Requirements:** Node.js (see `engines` in `package.json`), pnpm, PHP, Composer, Docker (for `wp-env`).

```bash
git clone https://github.com/bcgov/bcew-monorepo.git
cd bcew-monorepo
pnpm install
composer install
pnpm composer-install
pnpm build
```

**Docs locally:** `pnpm docs:dev`

**Run one project’s WordPress env:** from that project’s directory, `npx nx wp-env-start` (see the [Getting started](docs/getting-started.md) guide).

**Generators:** `npx nx generate monorepo:theme` or `npx nx generate monorepo:plugin`, then `pnpm install`. See [tools/monorepo/README.md](tools/monorepo/README.md).

**Release:** push tag `<nx-project-name>/v<semver>`; see [docs/release-and-deployment.md](docs/release-and-deployment.md) and [docs/versioning.md](docs/versioning.md).

---

## Monorepo scripts (summary)

Root `package.json` defines monorepo-wide commands. Common examples:

| Command | Purpose |
| --- | --- |
| `pnpm build` | `nx run-many` → `build` on all projects that define it |
| `pnpm composer-install` | Composer install for all projects with the target |
| `pnpm lint` | JS, CSS, PHP, Markdown, and `package.json` lint |
| `pnpm wp-env-stop` | `wp-env stop` via Nx for applicable projects |
| `pnpm wp-env-clean` | `wp-env clean` via Nx for applicable projects |

Full tables and target semantics live in the **[docs site](https://bcgov.github.io/bcew-monorepo/docs/)** (architecture, shared tooling, CI/CD).

---

## Contributing

- **Workflow and migrations:** [docs/contributing-workflow.md](docs/contributing-workflow.md)
- **Documentation:** [docs/contributing.md](docs/contributing.md)
- **CI workflows:** [.github/workflows/README.md](.github/workflows/README.md)
- **Issue reporting:** When opening a GitHub issue, use the Bug report or Feature request templates in [.github/ISSUE_TEMPLATE](.github/ISSUE_TEMPLATE) so the report includes the context maintainers need to triage it quickly.

### Checklist for Contributing features to the monorepo

Use this checklist before pushing a PR:

- [ ] I validated the changed project locally as needed
- [ ] `pnpm lint` passes
- [ ] `npx nx affected -t build` passes
- [ ] `npx nx affected -t test-integration` passes if applicable
- [ ] `npx nx affected -t test-e2e` passes if applicable
- [ ] `npx nx affected -t test-screenshot` passes if applicable
- [ ] I updated docs if needed
- [ ] I did not edit generated files under `docs/content/`
- [ ] If I added a new plugin or theme, I updated `.github/labeler.yml`

See [docs/contributing-workflow.md](docs/contributing-workflow.md), [docs/contributing.md](docs/contributing.md), and [.github/workflows/README.md](.github/workflows/README.md) for the full workflow and CI expectations.

---

## License

See individual packages for license files where applicable; monorepo metadata uses GPL-2.0-or-later in `package.json` where stated.
