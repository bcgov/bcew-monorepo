# Block architecture

The block metadata is defined in `src/chefs-form/block.json`. Its registered name is `bcew-chefs-embed/chefs-form`, its category is `widgets`, and its editor icon is the WordPress `media-document` Dashicon.

The block has two persisted attributes:

```json
{
	"formId": {
		"type": "string",
		"default": ""
	},
	"confirmationMessage": {
		"type": "string",
		"default": ""
	}
}
```

`confirmationMessage` is an optional plain-text override for the success message. When it is not empty, it replaces the confirmation message stored for the form. The server sanitizes it with `sanitize_textarea_field()`.

The API key and runtime token are never block attributes.

## Saved markup and transition to save.js

The block registers a `save` function (`src/chefs-form/save.js`). It stores the Form ID and confirmation override as `data-form-id` and `data-confirmation` on the block wrapper, with an empty `.bcew-chefs-form__mount` element. Existing posts saved by the earlier server-only block contain no markup. `src/chefs-form/deprecated.js` keeps those blocks valid, and the editor upgrades them to the new markup the next time the post is saved.

`block.json` still registers `render.php`, so published pages continue to use the server-rendered viewer with a short-lived token. When the block markup contains a mount but no viewer, `src/chefs-form/view.js` creates a `chefs-form-viewer` from the Form ID without a token. This is used once `render` is removed from `block.json`.

`src/chefs-form/utils/normalize-form-id.js` accepts a Form ID or a CHEFS share URL and returns the Form ID in lowercase. It returns an empty string for any other value. The block settings will use it to store a Form ID from either input.

## Data flow

The runtime path below shows the target server-rendered token flow from
DSWP-1232. The browser receives a short-lived token so the CHEFS viewer can
load the form, but it never receives the stored API key.

```mermaid
sequenceDiagram
    actor Admin as WordPress admin
    actor Editor as User with edit_posts
    actor Visitor as Public visitor
    participant WP as WordPress plugin
    participant DB as Plugin database
    participant CHEFS as CHEFS API
    participant Viewer as CHEFS viewer script

    Admin->>WP: Save Form ID and API key
    WP->>CHEFS: Validate credentials over HTTPS
    WP->>DB: Store Form ID and encrypted API key

    Editor->>WP: GET saved forms over HTTPS
    WP->>DB: Read Form IDs and names
    DB-->>WP: Form metadata only
    WP-->>Editor: Form IDs and names
    Editor->>WP: Save selected Form ID in block

    Visitor->>WP: Request public page over HTTPS
    WP->>DB: render.php reads encrypted credentials
    WP->>WP: Decrypt API key server-side
    WP->>CHEFS: Exchange Form ID and API key over HTTPS
    CHEFS-->>WP: Short-lived token
    WP-->>Visitor: Render viewer configuration with token
    Visitor->>Viewer: Load form with Form ID and token over HTTPS
    Viewer->>CHEFS: Request form over HTTPS
    CHEFS-->>Viewer: Form
```

Form IDs and encrypted API keys are stored by `src/CredentialsManager.php`.
Users with `edit_posts` can retrieve saved Form IDs and
select one in the block editor. Public visitors can load the published form
with the short-lived token produced during server rendering, but the API key
remains encrypted at rest and is only decrypted inside WordPress for the
server-to-server CHEFS token exchange.

## Editor flow

1. `src/chefs-form/edit.js` requests the saved forms from the `forms` REST route.
2. The stored CHEFS titles are displayed in the block sidebar.
3. Selecting a title updates the persisted `formId` attribute with the UUID.
4. If the selected Form ID is no longer saved, the editor clears the stale selection.
5. If no forms are saved, the sidebar shows a link to the plugin documentation.
6. The editor preview uses the runtime configuration endpoint and CHEFS viewer used by the published block.

The editor preview is provided by `src/chefs-form/components/chefs-form-preview.js`. It uses the same runtime configuration endpoint as the published block and loads the CHEFS viewer through `src/chefs-form/utils/ensure-chefs-form-viewer.js`.

## Frontend flow

`src/chefs-form/render.php` sanitizes the Form ID and renders the block wrapper with a `data-form-id` attribute. It renders an empty-state message when no Form ID is selected. It does not render an API key or token.

`src/chefs-form/view.js` runs in the browser after the page loads. For each block, it:

1. Finds the block wrapper and reads the Form ID from its `data-form-id` attribute.
2. Requests `/wp-json/bcew-chefs-embed/v1/embed-config?formId=<form-id>`. This request goes to WordPress, where the plugin retrieves the encrypted API key and exchanges it with CHEFS for a short-lived access token. The API key is never sent to the browser.
3. Loads the CHEFS form viewer web component from the CHEFS service if it is not already available on the page.
4. Creates the viewer inside the block's mount element and passes it the short-lived token and CHEFS base URL returned by WordPress. The visitor can then interact with the live form.
5. Listens for the viewer's `formio:submitDone` event. When submission succeeds, it removes the viewer and displays the configured confirmation message, or the generic success message when no custom message is configured.
6. Listens for the viewer's `formio:error` event. When CHEFS reports a submission error, it displays the error above the form and keeps the form available so the visitor can try again.

If the configuration request or viewer script fails before the form loads, the block displays a load error in place of the form.
