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

When `wp-env` starts, `.wp-env.json` runs `scripts/after-start.js` in the `cli` container.

The bootstrap script:

1. Activates `design-system-wordpress-child-theme-hporoo`.
1. Applies default local settings (permalinks, timezone, blog visibility, reading options).
1. Creates or updates a homepage with lorem ipsum content.
1. Creates or updates the posts page (`news`).
1. Sets Reading settings so homepage/posts point to those pages.
1. Creates additional pages: About Us, Contact Us with lorem ipsum content.
1. Creates a sample blog post with lorem ipsum content.

## Re-run Bootstrap Only

If WordPress is already running and you only want to re-apply seed/config:

```shell
wp-env run cli bash -c "node scripts/after-start.js"
```

## Verify Homepage Setup

```shell
wp-env run cli wp option get page_on_front
wp-env run cli wp option get page_for_posts
wp-env run cli wp post get $(wp-env run cli wp option get page_on_front) --field=post_title
```

## Backup and Restore (Dev DB)

Export:

```shell
# dev environment
npx wp-env run cli wp db export - > ./db/dev-backup-$(date +%Y%m%d).sql

# test environment
npx wp-env run tests-cli wp db export - > ./db/tests-backup-$(date +%Y%m%d).sql

```


Restore:

1. rename your database backup depending on its puprpose
    - `test-backup.sql` for test environment
    - `dev-backup.sql` for dev environment
2. save it in the root of your theme
3. run `npx wp-env run cli wp db import db/dev-backup.sql`
4. for interactivive use, run the following commands

```shell
npx wp-env run cli bash

#dev restore
wp db import db/dev-backup.sql

#tests restore
wp db import db/test-backup.sql
exit
```

> note: renaming is optional of course, if you want to interactively restore.


## Notes

### If environment state gets out of sync, reset and start again

```shell
wp-env cleanup --force
wp-env start --debug --update
```
