# BCEW CHEFS Embed

Plugin block reference for blocks provided by `bcew-chefs-embed`.

## Blocks

The CHEFS Form block embeds a published, public BC Government CHEFS form. In the editor, authors enter a Form ID or share URL and can preview the form. The block saves the normalized Form ID and loads the CHEFS form viewer web component on the published page. WordPress does not store CHEFS API keys or issue runtime tokens.

### Why this block is different from a typical WordPress custom block

- It depends on the external CHEFS service and its form viewer web component.
- The saved block markup contains the viewer element, Form ID, and CHEFS base URL; the browser loads the versioned viewer script at runtime.
- The block has no credentials settings page, API-key storage, token endpoint, or server-side rendering callback.


## Local Development environment

Run all of the following commands from the monorepo root:

- To start your local WordPress development environment
 
    ```shell
    pnpm install
    npx nx run bcew-chefs-embed:wp-env-start
    ```

- To Build assets if blocks do not appear in the inserter: `npx nx run bcew-chefs-embed:build`
- To Stop the local environment: `npx nx run bcew-chefs-embed:wp-env-stop`
- To Reset the local WordPress instance: `npx nx run bcew-chefs-embed:wp-env-clean`


## Where to learn more

### User Docs

Admin-focused setup and content authoring guidance is available in [User Docs](./user-docs).

### Developer Docs

A work-in-progress developer guide is available in [Developer Docs](./developer-docs).
