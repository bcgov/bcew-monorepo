# CHEFS Settings Integration Tests

Playwright integration tests for the CHEFS Admin Settings page in `bcew-chefs-embed`.

## Running

```bash
# All tests (from repo root)
npx nx run bcew-chefs-embed:test-e2e -- chefs-settings.spec.js

# Single test by name
npx nx run bcew-chefs-embed:test-e2e -- chefs-settings.spec.js -g "CHEFS menu appears"

# Headed mode
npx nx run bcew-chefs-embed:test-e2e -- chefs-settings.spec.js --headed

# Show trace after failure
npx playwright show-trace plugins/bcew-chefs-embed/artifacts/test-results/.../trace.zip
```

## Test Coverage

| Test | Acceptance Criterion |
| ------ | --------------------- |
| CHEFS menu appears in wp-admin sidebar | Menu visible in wp-admin |
| Settings page displays with correct UI elements | Form ID & API Key inputs + Save button |
| Can submit credentials form and see success message | Credentials stored in database |
| Saved credentials appear in "Configured Forms" list | Credentials readable by Form ID |
| Duplicate Form ID updates rather than creating a second record | UNIQUE KEY constraint (upsert) |
| Credentials stored with user_id and datetime | user_id & timestamps auto-stored |
| Credentials are readable by Form ID | Credentials readable by Form ID |
| Delete button removes credentials from list | CRUD delete |
| Form ID field is required | HTML5 required validation |
| API Key field is required | HTML5 required validation |
| API Key input is password type | API Key is masked |
| Nonce field is present in save form | CSRF protection |

## Notes

- Tests use timestamp-based API keys to avoid conflicts across runs.
- Static Form IDs are reused across runs; the database `upsert` handles duplicates.
- `submit_button()` renders `<input type="submit">` not `<button>` — selectors use `input[type="submit"][value="..."]`.

## Database verification

```bash
npx wp-env run cli -- wp db query "SELECT form_id, user_id, created_at, updated_at FROM wp_bcew_chefs_credentials ORDER BY created_at DESC;" --allow-root
```
