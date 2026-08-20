# BCEW CHEFS Embed

Plugin block reference for blocks provided by `bcew-chefs-embed`.

## Notes

- This section documents block behavior and content authoring expectations.
- Monorepo operational workflows are documented in central docs.

## Plugin Instructions

1. Install and activate the `bcew-chefs-embed` plugin in WordPress.
2. From the monorepo root, build plugin assets so blocks are registered (`build/` output must exist): `npx nx run bcew-chefs-embed:build`.
3. In the editor, insert blocks using the block inserter and search for the block name.
4. Configure block settings in the sidebar and publish/update the page.

## Local Development

This plugin includes its own `.wp-env.json`. Run the following commands from the monorepo root.

```bash
pnpm install
npx nx run bcew-chefs-embed:wp-env-start
```

All commands below run from the monorepo root:

- Build assets if blocks do not appear in the inserter: `npx nx run bcew-chefs-embed:build`
- Stop the local environment: `npx nx run bcew-chefs-embed:wp-env-stop`
- Reset the local WordPress instance: `npx nx run bcew-chefs-embed:wp-env-clean`

## Blocks

The CHEFS Form block embeds a BC Government CHEFS form on the page. In the editor, authors pick a saved Form ID from block settings. On the front end, the block renders a mount point and loads the CHEFS form viewer with a short-lived token.

Why this block is different from a typical WordPress custom block:

- It depends on an external service (CHEFS) and does not render all content from static block attributes alone.
- Form credentials are managed in plugin settings by administrators, not entered by content authors in the block.
- Runtime authentication is handled through a REST endpoint that exchanges the saved credentials for a short-lived token.
- It is a dynamic integration block: the final form experience is mounted by external viewer logic at runtime rather than being purely saved markup.

## User Docs

Admin-focused setup and content authoring guidance is available in [User Docs](./user-docs).

## Developer Docs

A work-in-progress developer guide is available in [Developer Docs](./developer-docs).
