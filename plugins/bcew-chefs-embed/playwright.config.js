import { defineConfig } from '@playwright/test';
import baseConfig from '@bcew-monorepo/e2e/playwright.config.js';

const config = defineConfig( {
    ...baseConfig,
    testDir: 'tests/e2e',
    workers: 1,
    globalSetup: require.resolve( './tests/e2e/global-setup.js' ),
} );

export default config;
