import { defineConfig } from '@playwright/test';
import baseConfig from '@wordpress/scripts/config/playwright.config.js';

const config = defineConfig( {
    ...baseConfig,
    testDir: 'tests/e2e',
    retries: process.env.CI ? 2 : 0,
    expect: {
        ...baseConfig.expect,
        toHaveScreenshot: {
            ...baseConfig.expect?.toHaveScreenshot,
            animations: 'disabled',
            caret: 'hide',
            timeout: 30000,
        },
    },
} );

export default config;
