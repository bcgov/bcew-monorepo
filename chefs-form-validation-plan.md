# CHEFS Form Validation Changes

## Ticket outcome

When a content creator saves a form, WordPress must ask CHEFS whether the
submitted Form ID and API key are valid. Fake or unrelated values must not be
stored. A valid form must appear in Saved forms and the block picker, and a
failed replacement must leave the existing good row unchanged.

The validation request should be designed so its response can later include
the CHEFS form name for DSWP-1193.

## Scope

This branch adds and tests the CHEFS authentication client and wires it into
the settings save flow before credentials are persisted.

## Changes in this branch

1. **Add `ChefsClient`**
   - Add `plugins/bcew-chefs-embed/src/ChefsClient.php`.
   - Send a `POST` request to
     `https://submit.digital.gov.bc.ca/app/gateway/v1/auth/token/forms/{formId}`.
   - Encode the Form ID and API key in the existing HTTP Basic Auth format.
   - Return the short-lived token only in the internal success result; do not
     persist or expose it as a credential.
   - Classify responses without returning upstream response bodies or secrets:
     - `form_not_found` for CHEFS `Bad formId` responses.
     - `invalid_credentials` for credential-related HTTP statuses.
     - `request_failed` for transport and other non-success failures.
     - `invalid_response` for successful responses without a usable token.

2. **Add client integration tests**
   - Add `plugins/bcew-chefs-embed/tests/test-chefs-client.php`.
   - Stub HTTP calls with `pre_http_request` so tests never contact CHEFS.
   - Verify the endpoint, Basic Auth header, successful token handling, form ID
     classification, credential failures, transport failures, and malformed
     successful responses.

3. **Add wp-env setup support**
   - Add `plugins/bcew-chefs-embed/tools/setup-bcew-chefs-embed-wp-env.sh`.
   - Reset the E2E mock setting, activate the test theme and plugin, and enable
     the mock setting in the test container.

4. **Complete save-time validation**
   - Call `ChefsClient::authenticate()` from the Saved forms save handler after
     capability, nonce, and input checks but before `CredentialsManager::save()`.
   - Show a clear form-not-found or invalid-credentials error when CHEFS rejects
     the request, without exposing upstream response bodies or API keys.
   - Preserve the existing row when a replacement Form ID or API key fails.
   - Let successful saves continue through the existing saved-form table and
     block-picker data paths.

5. **Destructive-action confirmation**
   - Require browser confirmation before removing a saved form or custom
     confirmation message.
   - Explain that removing a saved form deletes the WordPress configuration,
     removes it from the block picker, and cannot be undone; it does not delete
     the CHEFS form itself.
   - Cover the confirmation text and cancellation behavior in the settings and
     editor E2E tests.

## Remaining verification

- Run the focused integration and E2E targets in the configured wp-env.
- Confirm that the package user documentation describes validation failures and
  preservation of existing credentials.
- Add or confirm a browser test for a fake new Form ID/key if the current E2E
  mock only covers invalid replacement credentials.

## Validation status

The wp-env startup completed successfully. An earlier integration attempt used
the misspelled target `test-integraiton`; run the correctly named target:

```bash
CI=1 npx nx run bcew-chefs-embed:test-integration --no-tui
```
