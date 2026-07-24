# Documentation maintenance

For dependency update PRs and deferrals, see [Dependabot maintenance](./dependabot-maintenance.md).

## When to update documentation

Update docs **in the same pull request** as the behavior change when you:

- Add or remove Nx targets or change `nx.json` defaults
- Change CI workflows (affected detection, lint commands, release steps)
- Add a new plugin or theme (include `docs/index.md` and labeler entries)
- Change tagging, Composer, or deployment assumptions

## Ownership

- **Contributors** are responsible for keeping package-local docs (`plugins/<slug>/docs/`, `themes/<slug>/docs/`) accurate.
- **Maintainers / platform** own root workflows, GitHub Pages, and secrets (PATs for mirrors if used).
- **No silent TODOs** — If something is blocked, add a short note with **next step** and **who** should unblock (team name or role), or create an issue and link it.

## How to edit the docs site

1. **Monorepo guides** — Edit Markdown in `docs/*.md` (this folder).
2. **Package docs** — Edit files under `plugins/.../docs/` or `themes/.../docs/`; run `pnpm docs:dev` to preview.
3. **Navigation** — New top-level pages must be registered in `docs/.vitepress/config.mts` (sidebar and nav).
4. **Generated output** — Never commit hand-edits under `docs/content/`; it is produced by `tools/sync-docs.mjs`.

## Review checklist for doc PRs

- [ ] Links to GitHub paths use the correct branch or are relative where possible
- [ ] Commands tested from a clean clone or noted if environment-specific
- [ ] Versioning / release sections match current workflow YAML
- [ ] No personal machine paths (for example `/Users/...`)
