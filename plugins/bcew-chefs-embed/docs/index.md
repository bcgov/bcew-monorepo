# BCEW CHEFS Embed

Plugin block reference for blocks provided by `bcew-chefs-embed`.

## Blocks

The CHEFS Form block embeds a BC Government CHEFS Public form on the page. Authors enter a Form ID or share URL and an optional plain-text confirmation message in block settings. The frontend loads the versioned CHEFS viewer without an API key or token.

### Why this block is different from a typical WordPress custom block

- It depends on an external service (CHEFS) and does not render all content from static block attributes alone.
- The form must use CHEFS's Public login option and allow the WordPress site's origin.
- It is an integration block: saved markup provides a mount point, and the CHEFS viewer loads the live form at runtime.


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
