# monorepo-plugin

This library was generated with [Nx](https://nx.dev).

## Generators

### Create a plugin

```shell
npx nx generate monorepo-plugin:plugin
```

By default, this creates a plugin with one initial `sample-block`.

#### Sample Instructions

Create a plugin with the default `sample-block`:

```shell
npx nx generate monorepo-plugin:plugin --name="My Plugin" --description="My plugin description"
```

`wp-env` ports are assigned automatically by scanning existing `.wp-env.json` files in the monorepo and using the next free port pair (`port` and `testsPort`). Override with `--wpEnvPort=9010` only when you need a specific port.

#### Build For Gutenberg Registration

After generating a plugin or adding new blocks, build plugin assets before checking the block inserter in Gutenberg:

```shell
npx nx run <plugin-slug>:build
```

For active development, run the watch task in a separate terminal:

```shell
npx nx run <plugin-slug>:start
```

The generated plugin registers blocks from `plugins/<plugin-slug>/build`, so Gutenberg will not list new blocks until that folder is produced.

### Create a block in an existing plugin

```shell
npx nx generate monorepo-plugin:block <plugin-name> <block-name>
```

This generator is intentionally isolated. It does not create a plugin or compose blocks during plugin generation. It only adds a new block to an existing plugin project under `plugins/`.

Inputs:

- `plugin-name`: the existing Nx project name for the plugin, for example `bcgov-wordpress-blocks`
- `block-name`: the new block name or slug, for example `hero-banner`

The generator accepts either the Nx project name or a `plugins/...` path:

```shell
npx nx generate monorepo-plugin:block bcgov-wordpress-blocks hero-banner
npx nx generate monorepo-plugin:block plugins/bcgov-wordpress-blocks hero-banner
```

Validation rules:

- the plugin must already exist as a project under `plugins/`
- the plugin must have a `src` source root
- the block name must normalize to a non-empty slug
- the block must not already exist in the target plugin

Example:

```shell
npx nx generate monorepo-plugin:block bcgov-wordpress-blocks hero-banner
```

This command generates:

- `plugins/bcgov-wordpress-blocks/src/hero-banner/*`
- `plugins/bcgov-wordpress-blocks/tests/e2e/hero-banner.spec.js`
- `plugins/bcgov-wordpress-blocks/tests/screenshot/hero-banner.spec.js`

The block title is derived automatically from the block name, so `hero-banner` becomes `Hero Banner`.

## Building

Run `nx build monorepo-plugin` to build the library.
