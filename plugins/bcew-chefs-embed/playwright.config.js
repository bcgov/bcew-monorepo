import { defineConfig } from '@playwright/test';
import baseConfig from '@bcew-monorepo/e2e/playwright.config.js';

const config = defineConfig( {
    ...baseConfig,
    testDir: 'tests/e2e',
    // E2E specs share one WordPress database and mutate saved CHEFS forms.
    workers: 1,
} );

export default config;
