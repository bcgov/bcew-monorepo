# monorepo

This library was generated with [Nx](https://nx.dev).

## Generators

### Create a plugin

```shell
npx nx generate monorepo:plugin
```

By default, this creates a plugin with one initial `sample-block`.

#### Sample Instructions

Create a plugin with the default `sample-block`:

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

### Create a release tag

```shell
npx nx generate monorepo:release-tag
```

Prompts for a project name and a semantic version, validates both, then creates and pushes a Git tag in the required format `<project>/v<semver>`.

The version must be [Composer-compatible semver](https://semver.org): `MAJOR.MINOR.PATCH` with optional pre-release and build-metadata suffixes (e.g. `1.2.3`, `1.2.3-beta.1`, `1.2.3+build.42`). A leading `v` in the version input is accepted and stripped automatically.

#### Examples

Interactive (will prompt for project and version):

```shell
pnpm release
# or
npx nx generate monorepo:release-tag
```

Non-interactive:

```shell
npx nx generate monorepo:release-tag bcew-blocks 1.4.2
```

Create the tag locally without pushing to origin:

```shell
npx nx generate monorepo:release-tag bcew-blocks 1.4.2 --push=false
```

The created tag (`bcew-blocks/v1.4.2`) triggers the [`tag.yml`](../../.github/workflows/tag.yml) release workflow.

## Building

Run `nx build monorepo` to build the library.
