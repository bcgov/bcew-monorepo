# Developer docs

Existing local development and theme maintenance guidance for `bcew-theme`.

## Local development

Run WordPress locally for this theme with:

```bash
npx nx run bcew-theme:wp-env-start
npx nx run bcew-theme:start
```

Build theme assets with `npx nx run bcew-theme:build` and stop the environment with `npx nx run bcew-theme:wp-env-stop`.

## Template parts

See the [Developer Template Parts Guide](./guide/Developers/TemplateParts) for creating and registering template parts.

## Pattern troubleshooting

See [Patterns Troubleshooting](./guide/Developers/Patterns/PatternsTroubleShooting) for existing pattern troubleshooting guidance.

## Child themes

Child themes can inherit the theme's patterns and functionality.
