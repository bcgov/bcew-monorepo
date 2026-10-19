# Development setup

This guide covers the source layout and local development commands for `bcew-search`.

## Build and development

Run commands from the monorepo root. Install workspace dependencies once with `pnpm install`.

```bash
pnpm --filter wordpress-search build
pnpm --filter wordpress-search start
```

## Local WordPress environment

To start or stop the local WordPress environment:

```bash
pnpm exec nx run wordpress-search:wp-env-start
pnpm exec nx run wordpress-search:wp-env-stop
```
