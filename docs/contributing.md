# Contributing Docs

This page explains where to put docs and what your changes do in the site UI.

Run docs commands from the monorepo root (the folder that contains `package.json`).

## Where to write docs

Keep docs beside the code they describe:

- Plugin docs: `plugins/<plugin-slug>/docs/`
- Theme docs: `themes/<theme-slug>/docs/`

Every package with docs uses the same audience split:

- `index.md` (required): short landing page that links to both audience pages
- `user-docs.md`: the landing page for content authors and site editors
- `developer-docs.md`: the landing page for developers

New plugins and themes should follow this layout from the start.

Put topic pages under `user/` or `developer/`. User topics appear directly under the package in the sidebar; developer topics are grouped beneath a collapsed `Developer Docs` entry. Nested folders are supported and become collapsible groups. Link to the topic pages from the matching audience landing page. Keep images and other assets outside these topic folders.

Example:

```text
plugins/example-plugin/
  docs/
    index.md
    user-docs.md
    user/
      getting-started.md
      configuration.md
    developer-docs.md
    developer/
      local-development.md
      testing.md
```

## What changes appear where

- Add `docs/index.md` in a plugin or theme -> package appears in the left sidebar under `Plugins` or `Themes`.
- Add `user-docs.md` and `developer-docs.md` -> user topics appear directly under the package, and `Developer Docs` appears as a collapsed group.
- Add markdown files under `user/` -> topic links appear directly under the package.
- Add markdown files under `developer/` -> topic links appear beneath `Developer Docs`.
- Add markdown files elsewhere -> they get page routes but no sidebar entry. Link to them from an audience landing page.
- Add a heading like `## Setup` in a page -> appears in the right-side "On this page" links as `Setup`.
- Rename a heading -> right-side "On this page" link text also changes.
- Remove a heading -> its right-side link disappears.

Note: only headings in page content (`##`, `###`, etc.) create "On this page" links. A normal bold line is not a heading.

## Do not edit generated docs

`docs/content/` is generated output.
Do not edit files there directly because they are replaced during sync.

## How `docs:sync` works

`pnpm docs:sync` runs `tools/sync-docs.mjs`.

It:

- deletes `docs/content/` (generated output)
- recreates `docs/content/`
- copies package docs from:
    - `plugins/<slug>/docs/**` -> `docs/content/plugins/<slug>/`
    - `themes/<slug>/docs/**` -> `docs/content/themes/<slug>/`

Why this exists:

- The VitePress-based site builds from `docs/`
- package docs are owned inside package folders
- sync combines both into one build input

## Safe workflow (step-by-step)

1. Edit docs only in `plugins/.../docs` or `themes/.../docs`
2. Start docs: `pnpm docs:dev` (runs sync once on start, then re-runs sync when `plugins/**/docs/**`, `themes/**/docs/**`, or `tools/sync-docs.mjs` changes)
3. Check your package in the left sidebar shows user topics at package level and developer topics under `Developer Docs`
4. Open your page and check right-side "On this page" links
5. Commit source docs only (not generated `docs/content`)
