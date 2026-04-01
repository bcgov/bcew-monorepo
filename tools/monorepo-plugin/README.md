# monorepo-plugin

This library was generated with [Nx](https://nx.dev).

## Generators

### Block Version Update

Updates the `version` field in all `block.json` files across all plugins in the monorepo.

**Usage:**

```bash
nx generate monorepo-plugin:block-version-update <version>
```

**Example:**

```bash
nx generate monorepo-plugin:block-version-update 1.2.6
```

This command will:

- Scan all plugins in the `plugins` directory
- Recursively find all `block.json` files in each plugin's `src` folder
- Update the `version` field to the specified version
- Format the files

### Automated Version Bumping

Use the `version-bump.sh` script in the monorepo root to automatically detect plugin changes and update block versions:

```bash
./version-bump.sh
```

The script will:

- Check which projects have been affected by recent changes
- If any plugins are affected, prompt for a new version
- Run the block version update generator with the provided version

This is useful for automatically bumping versions when block code changes are detected.

## Building

Run `nx build monorepo-plugin` to build the library.
