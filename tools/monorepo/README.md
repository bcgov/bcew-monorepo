# monorepo

This library was generated with [Nx](https://nx.dev).

## Generators

### Create a plugin

```shell
npx nx generate monorepo:plugin
```

By default, this creates a plugin scaffold without blocks. Add blocks with `monorepo:block` after the plugin exists.

#### Sample Instructions

Create a plugin:

```shell
npx nx generate monorepo:plugin --name="My Plugin" --description="My plugin description"
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
npx nx generate monorepo:block <plugin-name> <block-name>
```

This generator is intentionally isolated. It does not create a plugin or compose blocks during plugin generation. It only adds a new block to an existing plugin project under `plugins/`.

Inputs:

- `plugin-name`: the existing Nx project name for the plugin, for example `bcew-blocks`
- `block-name`: the new block name or slug, for example `hero-banner`

The generator accepts either the Nx project name or a `plugins/...` path:

```shell
npx nx generate monorepo:block bcew-blocks hero-banner
npx nx generate monorepo:block plugins/bcew-blocks hero-banner
```

Validation rules:

- the plugin must already exist as a project under `plugins/`
- the plugin must have a `src` source root
- the block name must normalize to a non-empty slug
- the block must not already exist in the target plugin

Example:

```shell
npx nx generate monorepo:block bcew-blocks hero-banner
```

This command generates:

- `plugins/bcew-blocks/src/hero-banner/*`
- `plugins/bcew-blocks/tests/e2e/hero-banner.spec.js`
- `plugins/bcew-blocks/tests/screenshot/hero-banner.spec.js`

The block title is derived automatically from the block name, so `hero-banner` becomes `Hero Banner`.

### Cut a release

Releases are cut from GitHub Actions. Open **Actions → Release Subproject and Update packages.json**, pick the project, and leave **Alpha** ticked unless this is a real release. The workflow chooses the version, commits `package.json` and `CHANGELOG.md`, creates the `<project>/v<version>` tag, and publishes the zip. See [CI/CD](../../docs/ci-cd.md).

## Building

Run `nx build monorepo` to build the library.
