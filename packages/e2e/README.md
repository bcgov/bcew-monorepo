# e2e

This package demonstrates how internally sharing npm code between plugins/themes could work. Doing it this way means not having to use brittle relative paths (eg. `import { PageHelpers } from '../../shared/e2e';`).

## Usage

In the plugin or theme `package.json`:

```json
  "devDependencies": {
    "@wordpress-monorepo/e2e": "workspace:*",
  },
```

Then in a JS file:

```js
import { PageHelpers } from '@wordpress-monorepo/e2e';

const helpers = new PageHelpers();
```
