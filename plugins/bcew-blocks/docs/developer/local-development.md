# Local development

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
