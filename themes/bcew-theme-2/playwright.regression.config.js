import { defineConfig } from '@playwright/test';
import baseConfig from '@wordpress-monorepo/e2e/playwright.config.js';

const config = defineConfig({
    ...baseConfig,
    testDir: 'tests/screenshot',
});

export default config;
