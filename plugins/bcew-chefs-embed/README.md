# bcew-chefs-embed

Embed BC Government Common Hosted Form Service (CHEFS) forms into WordPress pages and posts.

## Testing Setup

Run all commands from the monorepo root unless noted.

### Local WordPress environments (wp-env)

This plugin uses package-local `wp-env` config files:

- `plugins/bcew-chefs-embed/.wp-env.json`
- `plugins/bcew-chefs-embed/.wp-env.override.json`

Ports:

- Development site: `http://localhost:9012`
- Test site (used by Playwright/e2e): `http://localhost:9013`

Start/stop:

```bash
npx nx run bcew-chefs-embed:wp-env-start
npx nx run bcew-chefs-embed:wp-env-stop
```

### Test commands

Build:

```bash
npx nx run bcew-chefs-embed:build
```

Integration (PHPUnit in `tests-cli`):

```bash
npx nx run bcew-chefs-embed:test-integration
```

E2E (Playwright):

```bash
npx nx run bcew-chefs-embed:test-e2e
```

Screenshot regression:

```bash
npx nx run bcew-chefs-embed:test-screenshot
npx nx run bcew-chefs-embed:test-screenshot-generate
```

### Debug logging during tests

`WP_DEBUG` and `WP_DEBUG_LOG` are enabled in the override config for both dev and test environments, including `env.tests.config` for the test site used by e2e.

Current `plugins/bcew-chefs-embed/.wp-env.override.json`:

```json
{
	"phpmyadmin": true,
	"config": {
		"WP_DEBUG": true,
		"WP_DEBUG_LOG": true,
		"WP_DEBUG_DISPLAY": false
	},
	"env": {
		"tests": {
			"config": {
				"WP_DEBUG": true,
				"WP_DEBUG_LOG": true,
				"WP_DEBUG_DISPLAY": false
			}
		}
	}
}
```

If you add debug statements (for example `error_log()` in plugin init), check logs inside the test container:

```bash
cd plugins/bcew-chefs-embed
wp-env run tests-wordpress --env-cwd=wp-content/plugins/bcew-chefs-embed sh -lc "tail -n 100 /var/www/html/wp-content/debug.log"
```

If `debug.log` is missing or stale:

1. Restart wp-env so config changes are regenerated.
2. Re-run e2e/integration once to trigger requests.

```bash
cd plugins/bcew-chefs-embed
wp-env stop
wp-env start
```
