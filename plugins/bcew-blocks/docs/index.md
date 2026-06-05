# BCEW Blocks

Plugin block reference for blocks provided by `bcew-blocks`.

## Notes

- This section documents block behavior and content authoring expectations.
- Monorepo operational workflows are documented in central docs.

## Plugin Instructions

1. Install and activate the `bcew-blocks` plugin in WordPress.
2. Ensure plugin assets are built so blocks are registered (`build/` output must exist).
3. In the editor, insert blocks using the block inserter and search for the block name.
4. Configure block settings in the sidebar and publish/update the page.

## Local Development

This plugin includes its own `.wp-env.json`, so you can run WordPress from the plugin directory.

```bash
cd plugins/bcew-blocks
pnpm install
pnpm wp-env start
pnpm start
```

Notes:

- Run `pnpm build` at least once if blocks do not appear in the inserter.
- Use `pnpm wp-env-stop` from the monorepo root (or `npx nx wp-env-stop` in this directory) to stop the local environment.
- Use `pnpm wp-env clean` to reset the local WordPress instance.

## Blocks

- [Icon](./icon)
- [Media & Text Layout](./media-text-layout)
