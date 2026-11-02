# REST API

The plugin registers routes under `/wp-json/bcew-chefs-embed/v1`.

## Get saved forms

```text
GET /wp-json/bcew-chefs-embed/v1/forms
```

The block editor uses this route to populate its form-title selector. It
requires the current user to have the `edit_posts` capability and returns saved
form titles plus their IDs. Unauthorized requests receive a `403` response.

The route is registered in `bcew-chefs-embed.php` and handled by
`bcew_chefs_embed_get_saved_forms()`.

## Get embed configuration

```text
GET /wp-json/bcew-chefs-embed/v1/embed-config?formId=<form-id>
```

The editor preview and published frontend use this route. It is public because an anonymous visitor must be able to load a published form. The route:

1. Looks up the configured Form ID.
2. Decrypts its stored API key on the server.
3. Sends a server-to-server Basic Authentication request to CHEFS.
4. Returns the short-lived token, CHEFS base URL, and configured confirmation message.

The API key is not included in the response. Omitting the required `formId` parameter returns `400`; an unknown or undecryptable Form ID returns `404`. Failures contacting CHEFS or invalid CHEFS responses return an error response from the gateway/authentication path.

The route is registered and handled by `src/EmbedConfigController.php`.
