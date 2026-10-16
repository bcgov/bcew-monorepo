# Requirements and development setup

- WordPress 6.7+
- PHP 7.4+
- Composer
- Node.js `^24.12.0`
- pnpm (the monorepo package manager)

From the monorepo root:

```shell
pnpm install
npx nx run bcew-document-repository:composer-install
npx nx run bcew-document-repository:build
## Optional: start a local WordPress environment
npx nx run bcew-document-repository:wp-env-start
```

After these steps, activate the plugin from WordPress Admin (or use the wp-env site).
