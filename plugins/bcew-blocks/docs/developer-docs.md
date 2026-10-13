# Developer docs

This guide covers local development and the block reference for the `bcew-blocks` plugin.

## Plugin overview

- Monorepo operational workflows are documented in central docs.
- Plugin assets must be built so blocks are registered (`build/` output must exist).

## Local development

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

## Block reference

### Icon

- Block name: `bcew-blocks/icon`
- Category: `media`

Attributes:

- `iconId` (`string`): selected icon identifier
- `iconSize` (`string`, default `medium`): display size
- `isDecorative` (`boolean`, default `false`): whether assistive tech should ignore the icon
- `accessibleName` (`string`): accessible text label when icon is not decorative

### Media & Text Layout

- Block name: `bcew-blocks/media-text-layout`
- Category: `media`

Attributes:

- `imageId` (`number`): selected media library image ID
- `imagePosition` (`string`, default `left`): media placement relative to text

## Related documentation

For content-authoring instructions, see [User docs](./user-docs).

For the plugin overview, see [Plugin overview](./index).
