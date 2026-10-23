# e2e

This package demonstrates how internally sharing npm code between plugins/themes could work. Doing it this way means not having to use brittle relative paths (eg. `import { PageHelpers } from '../../shared/e2e';`).

## Usage

In the plugin or theme `package.json`:

```json
  "devDependencies": {
    "@bcew-monorepo/e2e": "workspace:*",
  },
```

Then in a JS file:

```js
import { PageHelpers } from '@bcew-monorepo/e2e';

const helpers = new PageHelpers();
```

Playwright tests can import the shared `test` fixture to scan the current page
against WCAG 2.0 A and AA rules:

```ts
import { expect } from '@playwright/test';
import { test } from '@bcew-monorepo/e2e';

test( 'page has no accessibility violations', async ( { page, axe } ) => {
    await page.goto( '/' );

    const { violations } = await axe.analyze();

    expect( violations ).toHaveLength( 0 );
} );
```
