import { defineConfig } from '@playwright/test';
import baseConfig from '@bcew-monorepo/e2e/playwright.config.js';

const baseUrl = process.env.WP_BASE_URL || 'http://localhost:9013';

const config = defineConfig( {
    ...baseConfig,
    testDir: 'tests/e2e',
    workers: 1,
    use: {
        ...baseConfig.use,
        baseURL: `${ baseUrl }/`,
    },
    webServer: {
        ...baseConfig.webServer,
        port: new URL( baseUrl ).port,
    },
} );

export default config;
