# Local development

Run commands from the monorepo root.

## Install dependencies

```shell
pnpm install
npx nx run bcew-chefs-embed:composer-install
```

The Composer target installs the plugin's PHP development dependencies. The plugin requires PHP 7.4.

## Build and start WordPress

```shell
npx nx run bcew-chefs-embed:build
npx nx run bcew-chefs-embed:wp-env-start
```

The local site is available at `http://localhost:9012`. WordPress Admin is available at `http://localhost:9012/wp-admin`.
The test environment uses port `9013` and is used by the Playwright targets. It is separate from the normal development site on port `9012`.

The `wp-env` lifecycle script activates the plugin after the environment starts. Build the assets again after changing block JavaScript, styles, or metadata.

## CHEFS viewer

The block loads the immutable CHEFS 1.1.0 viewer without an API key or token.

Until CHEFS deploys 1.1.0 to production, `https://submit.digital.gov.bc.ca/app/embed/1.1.0/...` redirects to a login page, and the browser reports a CORS error. To test live locally, use the CHEFS PR-1966 deployment (`https://chefs-dev.apps.silver.devops.gov.bc.ca/pr-1966`).

### Test against the CHEFS PR-1966 deployment

1. Temporarily point the plugin at that deployment. Do not commit these changes:
    - In `src/chefs-form/utils/constants.js`, set `CHEFS_BASE_URL` to `https://chefs-dev.apps.silver.devops.gov.bc.ca/pr-1966`.
    - In `bcew-chefs-embed.php`, set `BCEW_CHEFS_EMBED_CHEFS_ORIGIN` to `https://chefs-dev.apps.silver.devops.gov.bc.ca` so the CSP allows the script and API requests.
2. Rebuild with `npx nx run bcew-chefs-embed:build`.
3. Sign in to `https://chefs-dev.apps.silver.devops.gov.bc.ca/pr-1966` and create or open a form you own. Forms from other CHEFS environments do not exist there.
4. Publish the form and set its login option to **Public**.
5. Open **Manage Form → Web Component** (`/form/manage?f=<formId>`) and add `http://localhost:9012` to **Allowed origins**. Use the exact scheme and port, with no trailing slash or path. The `/form/publish` page has no settings.
6. Check access from the terminal:

    ```shell
    curl -s -H "Origin: http://localhost:9012" \
      https://chefs-dev.apps.silver.devops.gov.bc.ca/pr-1966/webcomponents/v1/public/<formId>/schema | head -c 200
    ```

    A JSON schema means the form is embeddable.

7. Add the CHEFS Form block to a post at `http://localhost:9012`, enter the Form ID, and follow the [manual smoke test](./testing-and-verification.md#manual-smoke-test).
8. Revert the two temporary changes and rebuild when finished.

### Troubleshooting

| Symptom                                               | Cause                                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Console CORS error loading `chefs-form-viewer.min.js` | The base URL still points at production, which does not serve 1.1.0 yet.                    |
| Console CSP error                                     | `BCEW_CHEFS_EMBED_CHEFS_ORIGIN` does not match the host in `CHEFS_BASE_URL`.                |
| `403 This website is not allowed to embed this form.` | The WordPress origin is not in the form's **Allowed origins**.                              |
| `404` or "Resource not found"                         | The form ID does not exist in that CHEFS environment, is unpublished, or is not **Public**. |

Playwright tests register an in-page viewer stub, so they do not depend on the
live CHEFS service or make authenticated requests.

## Stop or reset WordPress

```shell
npx nx run bcew-chefs-embed:wp-env-stop
npx nx run bcew-chefs-embed:wp-env-clean
```
