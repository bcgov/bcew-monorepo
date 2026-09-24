# Rename a plugin or theme

## Overview

Replace the old identity with **BCEW** (British Columbia Extended Web) naming.

Do not open a pull request until the **newly named BCEW Theme or Plugin** is running on test.

**Search only the plugin/themes folder**. Do not find-and-replace the whole monorepo.

Use your editor’s **Find** (Mac or Windows) in that folder. The ticket tells you what to search for. Common searches:

- The old slug (for example `design-system-wordpress-theme`, `wordpress-document-repository`)
- `design-system`, `design system`, `DSWP`, `dswp`
- The old display name from the ticket

Replace with the new slug and display name from the ticket. Work through steps 2–5 in order — not one big find-and-replace.

## 1. Rename the folder

Use `git mv`. Do not drag the folder in Finder.

**Plugin:**

```bash
git mv plugins/<old-slug> plugins/<new-slug>
git mv plugins/<new-slug>/<old-slug>.php plugins/<new-slug>/<new-slug>.php
```

**Theme:**

```bash
git mv themes/<old-slug> themes/<new-slug>
```

Use the slugs from the ticket.

**Plugins with a JS app:** also `git mv` folders that match the old slug (for example `assets/js/apps/<old-slug>/` → `assets/js/apps/<new-slug>/`) and update build paths in `package.json`.

## 2. Change these in this project

After the folder rename, find the old name again inside `plugins/<new-slug>/` or `themes/<new-slug>/`.

| File                         | Change                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------- |
| `project.json`               | `name`, `root`, `sourceRoot` → new slug; generator `slug` → new slug (themes) |
| `composer.json`              | `"name"` → `bcgov-plugin/<new-slug>` or `bcgov-theme/<new-slug>`              |
| `package.json`               | `name`, `homepage`, `repository.directory`, build script paths → new slug     |
| Plugin header or `style.css` | `Plugin Name:` / `Theme Name:`, URI, `Text Domain:` → new names               |
| `theme.json`                 | `title`, `textDomain` → new names (if present)                                |
| `.wp-env.json`               | `wp plugin activate <new-slug>` or `wp theme activate <new-slug>`             |
| README and `docs/`           | old slug and old display name → new names                                     |

## 3. Update PHP, CSS, and JS names (where safe)

Search again for the old slug in `.php`, `.js`, `.jsx`, `.ts`, `.tsx`, `.scss`, and `.css` files inside this project.

**Change these together** — if you rename a CSS class, update the matching rule in SCSS/CSS, the `className` in JS, and any HTML or PHP that outputs it in the same edit:

| Kind                                   | Change                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| CSS / SCSS classes                     | Old slug prefix → new slug (for example `.wordpress-document-repository` → `.bcew-document-repository`)    |
| JS `className`                         | Match the CSS change                                                                                       |
| PHP global functions                   | Rename `old_slug_*` functions to `new_slug_*`; update every `add_action` / `add_filter`                    |
| Script and style handles               | Old slug → new slug in `wp_enqueue_*` calls                                                                |
| DOM `id`s and app mount points         | Old slug → new slug (for example `#bcew-document-repository-app`)                                          |
| REST namespace, menu slugs, nonce keys | Old slug → new slug when they only identify this project in code                                           |

See step 5 before changing any string that might already be saved on a live site.

## 4. Change two repo files

| File                        | Change                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `.github/labeler.yml`       | Rename the project key and path to `plugins/<new-slug>/**` or `themes/<new-slug>/**` (or add if new) |
| `.github/workflows/tag.yml` | **Add** `<new-slug>` to the project dropdown (imported standalones were never listed here)           |

**Child theme using this as parent** (only other project you may touch):

| File           | Change                                    |
| -------------- | ----------------------------------------- |
| `style.css`    | `Template:` → `<new-slug>`                |
| `.wp-env.json` | parent path → `"../../themes/<new-slug>"` |

## 5. Do not change stored names

Rename the **package** (folder, Composer name, plugin header). Do not rename **data** WordPress already saved.

**One question before you change a string:** would a site that already runs the old plugin/theme break if the database still has the old value? If yes, leave it — even when it still says design system, DSWP, or the old slug.

| You find it in…                                              | Leave it alone                                          |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| `get_option`, `update_option`, `register_setting`            | Option keys and settings group names                    |
| `get_post_meta`, `update_post_meta`                          | Meta keys                                               |
| First argument to `do_action`, `add_action`, `apply_filters` | Hook names                                              |
| `register_post_type`, `register_taxonomy`                    | Post type and taxonomy slugs                            |
| `block.json`, block patterns, `theme.json` colour presets    | Block names, pattern slugs, preset slugs                |
| Post content, patterns, or upload folder paths               | CSS classes in saved HTML, media URL paths              |
| `__( '…', 'text-domain' )` owned by another package          | Shared text domains (for example `bcgov-design-system`) |
| Composer `autoload` `psr-4`                                  | PHP namespace (unless the ticket says to change it)     |

When in doubt, leave it and note it on the ticket.

## 6. Test locally

From the monorepo root (use the new slug from the ticket):

```bash
pnpm install
npx nx run <new-slug>:build
npx nx run <new-slug>:wp-env-start
pnpm lint
```

Run this project’s tests. Click through admin, the front end, and the main feature.

```bash
npx nx run <new-slug>:wp-env-stop
```

## 7. Test on test (blog repo) — before the PR

Test site: `test.vanity.blog.gov.bc.ca`

Blog repo: [blog_gov_bc_ca](https://bitbucket.org/bc-gov/blog_gov_bc_ca) on Bitbucket (`bc-gov/blog_gov_bc_ca`). Plugins and themes are Composer packages in the root `composer.json`. They install to `web/app/plugins/` and `web/app/themes/`. The `https://bcgov.github.io/bcew-monorepo` repository is already in `composer.json`. Both the **old** and **new** package can be in `require` at the same time.

**Step 4 must be done first** — `<new-slug>` has to be in `.github/workflows/tag.yml` or the release workflow cannot run.

### Monorepo: publish a pre-release from your branch

1. Push your monorepo branch.
2. GitHub → **bcew-monorepo → Actions → Release Subproject and Update packages.json → Run workflow**.
3. **Use workflow from:** your branch
4. **Project to release:** `<new-slug>`
5. **Version:** `<current-version>-alpha.1` (example: `1.16.0-alpha.1`)
6. **Is this a pre-release?:** checked
7. Run it. Wait for green. This publishes a zip to GitHub Releases and adds `bcgov-plugin/<new-slug>` or `bcgov-theme/<new-slug>` to [packages.json](https://bcgov.github.io/bcew-monorepo/).

### Blog repo: install the pre-release on test

**1.** Clone [blog_gov_bc_ca](https://bitbucket.org/bc-gov/blog_gov_bc_ca). Branch from `development`.

**2.** In `composer.json`, add the **new** package at the pre-release version from monorepo step 5. Keep the **old** package in `require`.

```json
"bcgov-plugin/<old-slug>": "<existing-version>",
"bcgov-plugin/<new-slug>": "1.16.0-alpha.1"
```

For a theme, use `bcgov-theme/<new-slug>` instead of `bcgov-plugin/<new-slug>`.

**3.** Update the lock file and commit both files:

```bash
composer update bcgov-plugin/<new-slug>   # or bcgov-theme/<new-slug> for themes
git add composer.json composer.lock
git commit -m "Add <new-slug> pre-release for rename testing"
```

**4.** Push to `development` (or open a PR to `development` and merge). Wait for deploy to test.

**5.** Log in to `test.vanity.blog.gov.bc.ca/wp-admin`:

- **Plugin:** Plugins → deactivate `<old-slug>` → activate `<new-slug>`
- **Theme:** Appearance → Themes → activate `<new-slug>`

**6.** Click through admin, front end, and the main feature — same checks as step 6.

The old name must be **off** and the new name **on**. Then open the monorepo PR.

## 8. Open the PR

Open the monorepo pull request when test runs the **new slug**.

## 9. Production (later)

Same as test: both names exist at first. Disable old, enable new, click through. Remove the old name from deploy only when you are sure.
