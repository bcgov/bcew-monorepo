# === <%= name %> ===

Contributors:      The BCGov Custom Web team
Tags:              block
Tested up to:      6.8
Stable tag:        0.0.1
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

## == <%= description %> ==

This is the long description. No limit, and you can use Markdown (as well as in the following sections).


## == Installation ==

1. Upload the plugin files to the `/wp-content/plugins/<%= slug %>` directory.
2. Activate the plugin through the 'Plugins' screen in WordPress.

## == Local Development ==

1. Install dependencies: `pnpm install && composer install`
2. Start local WordPress: `pnpm run wp-env:start`
3. In a separate terminal, start block development build: `pnpm start`
4. Activate the plugin at `http://localhost:8888/wp-admin/plugins.php`

> **Note:** The block will not appear in the editor until step 1 has been run at
> least once. The plugin requires a `build/` directory produced by `pnpm start` or
> `pnpm run build` to register blocks with WordPress.

### This project includes a `.wp-env.json` for consistent local development

= Ports =

* `port` sets the main local WordPress site port (default in this template: `8888`).

= Config constants =

* `WP_ENVIRONMENT_TYPE`: marks the site as `local` so code can branch behavior by environment.
* `WP_DEBUG`: enables WordPress debug mode.
* `WP_DEBUG_LOG`: writes debug output to `wp-content/debug.log`.
* `WP_DEBUG_DISPLAY`: controls whether debug messages are shown in page output.
* `SCRIPT_DEBUG`: forces non-minified core scripts and styles for easier debugging.
* `DISALLOW_FILE_MODS`: disables plugin/theme/core installs and updates in wp-admin.
* `AUTOMATIC_UPDATER_DISABLED`: turns off automatic background updates.

These defaults are aimed at reproducible local environments and safer team workflows.

## == Visual Regression Testing ==

This template includes Playwright screenshot tests in `tests/screenshot` for catching visual regressions.

1. Build assets: `pnpm run build`
2. Start WordPress: `pnpm run wp-env:start`
3. Generate baseline screenshots: `pnpm run test:screenshot:update`
4. Run visual regression checks: `pnpm run test:screenshot`


## == Frequently Asked Questions ==

= A question that someone might have =

An answer to that question.

= What about foo bar? =

Answer to foo bar dilemma.

## == Screenshots ==

1. This screen shot description corresponds to screenshot-1.(png|jpg|jpeg|gif). Note that the screenshot is taken from
the /assets directory or the directory that contains the stable readme.txt (tags or trunk). Screenshots in the /assets
directory take precedence. For example, `/assets/screenshot-1.png` would win over `/tags/4.3/screenshot-1.png`
(or jpg, jpeg, gif).
2. This is the second screen shot

