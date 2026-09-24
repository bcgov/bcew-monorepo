# BCEW CHEFS Embed

Plugin block reference for blocks provided by `bcew-chefs-embed`.

## Blocks

The CHEFS Form block embeds a BC Government CHEFS form on the page. In the editor, authors pick a saved Form ID from block settings. On the front end, the block renders a mount point and loads the CHEFS form viewer with a short-lived token.

### Why this block is different from a typical WordPress custom block

- It depends on an external service (CHEFS) and does not render all content from static block attributes alone.
- Form credentials are managed in plugin settings by administrators, not entered by content authors in the block.
- Runtime authentication is handled through a REST endpoint that exchanges the saved credentials for a short-lived token.
- It is a dynamic integration block: the final form experience is mounted by external viewer logic at runtime rather than being purely saved markup.


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
