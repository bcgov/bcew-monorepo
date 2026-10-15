# Developer docs

This guide covers the source layout and local development commands for `bcew-search`.

## Build and development

Run commands from the monorepo root. Install workspace dependencies once with `pnpm install`.

```bash
pnpm --filter wordpress-search build
pnpm --filter wordpress-search start
```

To start or stop the local WordPress environment:

```bash
pnpm --filter wordpress-search run wp-env start
pnpm --filter wordpress-search run wp-env stop
```

## Tests

```bash
pnpm --filter wordpress-search run test:unit:js
pnpm --filter wordpress-search run test:e2e
pnpm --filter wordpress-search run test:unit:php
```

## Related documentation

For content-authoring instructions, see [User docs](./user-docs).
