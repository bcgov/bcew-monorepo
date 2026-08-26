import { defineConfig } from '@playwright/test';
import baseConfig from '@wordpress/scripts/config/playwright.config.js';

const config = defineConfig( {
    ...baseConfig,
    // Scope regular E2E runs to the dedicated end-to-end suite only.
    // Screenshot regression tests live under `tests/screenshot` and are
    // intentionally run by the dedicated regression config instead.
    testDir: 'tests/e2e',
} );

export default config;
