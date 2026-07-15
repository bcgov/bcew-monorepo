# Contributing and migration workflow

## Day-to-day contribution

1. Branch from `main` using [branch naming](./versioning.md#branch-naming).
2. Make changes; keep docs and `.github/labeler.yml` in sync when you add projects or change conventions.
3. Open a pull request; CI runs monorepo lint and **`nx affected`** build and tests (see [CI/CD](./ci-cd.md)).
4. After merge, releases are driven by **tags**, not by committing build artifacts to `main`.

## After checking out a branch

Build output (`dist/` and similar artifacts) is **not** committed to the repository. Whenever you check out or pull a branch—especially when reviewing a pull request—refresh dependencies and rebuild so your local environment matches that branch:

```bash
pnpm install
pnpm build
```

Run both from the monorepo root. To rebuild only the project you are reviewing:

```bash
pnpm install
npx nx run <project-name>:build
```

## Adding a new repository (greenfield)

Prefer the **generators** so structure matches standards:

```bash
npx nx generate monorepo:theme
# or
npx nx generate monorepo:plugin
pnpm install
```

Then implement features, add `docs/index.md` for the docs site, and register paths in `.github/labeler.yml` if needed.

## Importing an existing repository (history preservation)

> **Warning:** Import and history rewriting steps must **not** be run against the original standalone repository. Work from a **new clone** of the monorepo or a dedicated migration branch.

### Preconditions

Coordinate with maintainers before large imports:

- **Development freeze** on the source repo (optional but recommended) so the import has a clear cut-over commit.
- **Final release** from the legacy repo if consumers need a last semver from the old remote.
- **Access** to create tags and run CI in this monorepo.

### 1. Import Git history (`nx import`)

```bash
npx nx import <git-repository-url> <destination-path>
```

Example:

```bash
npx nx import https://github.com/bcgov/design-system-wordpress-theme themes/design-system-wordpress-theme
```

Complete the wizard; history for the subtree is preserved in the monorepo.

### 2. Align structure with monorepo standards

After import, the tree often needs to match generator output:

1. Temporarily rename the imported directory (for example prefix with `_`) so generators can write a fresh folder.
2. Run the appropriate generator (`monorepo:theme` or `monorepo:plugin`) with the **same slug** as the imported project.
3. Copy generated files **into** the renamed import directory, overwriting where appropriate (some hosts block bulk overwrites in the IDE; use the filesystem if needed).
4. Remove the empty generator-only directory; restore the imported directory name.
5. Use Git to **revert** any overwrite that should stay legacy (for example real version numbers instead of generator defaults).
6. Remove redundant per-repo files that now belong at the root (see [Shared tooling](./shared-tooling.md)):
   - `.github/` (per-package workflows)
   - `dist/` / build output
   - Duplicate `.gitignore`, `.markdownlint*`, `CODEOWNERS` if superseded by monorepo policy
   - `composer.lock` at package level when the monorepo standard is root + package resolution (follow team practice)
7. Commit the migration; run `pnpm composer-install`, `npx nx run <project>:build`, and `pnpm lint`.

### Tag namespacing after migration

First release from the monorepo must use the **Nx project name** and [tag format](./versioning.md#tag-format):

```text
<nx-project-name>/v<semver>
```

Legacy tags from the old repository are **not** reused as-is; document mapping for consumers if needed.

### Branch naming

Use [documented conventions](./versioning.md#branch-naming) (`feature/…`, `fix/…`, `chore/…`, etc.) so reviewers and automation stay consistent.

## Checklist (migration)

- [ ] Import completed with `nx import` (history preserved)
- [ ] `project.json`, `package.json`, and `composer.json` valid for Nx and CI
- [ ] Redundant config removed; root tooling used where possible
- [ ] `.github/labeler.yml` updated
- [ ] Package `docs/index.md` added or ported
- [ ] `pnpm lint` and affected `build` / tests pass locally
- [ ] First monorepo tag planned with namespaced format
