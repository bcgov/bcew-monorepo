# HPOROO Local wp-env Setup

## Quick Start

1. From the repo root, go to this site folder:

```shell
cd sites/hporoo
```

1. Start the local environment:

```shell
npx wp-env start --debug --update
```

## What Local Bootstrap Does

When `wp-env` starts from `sites/hporoo`, `.wp-env.json` runs `scripts/after-start.js` on the host.

The bootstrap script:

1. Activates `design-system-wordpress-child-theme-hporoo` in both `cli` and `tests-cli`.
1. Imports `db/starter.sql` into both environments with `wp db import` when that file exists.

## Re-run Bootstrap Only

If WordPress is already running and you want to re-apply the starter import:

```shell
node scripts/after-start.js
```

## Verify Bootstrap

```shell
wp-env run cli wp theme list --status=active
wp-env run tests-cli wp theme list --status=active
```

## Starter Database Workflow

Create or refresh the reusable starter backup:

```shell
# dev environment
npx wp-env run cli wp db export - > ./db/starter.sql
```

If you prefer keeping dated backups, export to a dated filename first and then rename or copy the one you want to keep as `db/starter.sql`.

On every `npx wp-env start --debug --update`, `scripts/after-start.js` imports `db/starter.sql` into both the dev and test databases automatically.

## Common wp-env Commands

Run these from `sites/hporoo`:

```shell
# start
npx wp-env start --debug --update

# clean
npx wp-env clean

# export the test database
npx wp-env run tests-cli wp db export - > ./db/tests-backup-$(date +%Y%m%d).sql

# export the dev database
npx wp-env run cli wp db export - > ./db/dev-backup-$(date +%Y%m%d).sql

# import the test database from starter.sql
npx wp-env run tests-cli wp db import db/starter.sql

# import the dev database from starter.sql
npx wp-env run cli wp db import db/starter.sql

# force cleanup and start fresh
npx wp-env cleanup --force
npx wp-env start --debug --update
```

## Notes

### If environment state gets out of sync, reset and start again

```shell
npx wp-env cleanup --force
npx wp-env start --debug --update
```
