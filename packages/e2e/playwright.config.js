import { defineConfig } from '@playwright/test';
import baseConfig from '@wordpress/scripts/config/playwright.config.js';

const chromiumProject = baseConfig.projects[ 0 ];

const config = defineConfig( {
    ...baseConfig,
    testDir: './tests/e2e',
    snapshotPathTemplate:
        '{testDir}/{testFileDir}/__snapshots__/{arg}-chromium{ext}',
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    expect: {
        ...baseConfig.expect,
        toHaveScreenshot: {
            ...baseConfig.expect?.toHaveScreenshot,
            animations: 'disabled',
            caret: 'hide',
            timeout: 30000,
        },
    },
    projects: [
        {
            ...chromiumProject,
            name: 'e2e',
            testDir: './tests/e2e',
        },
        {
            ...chromiumProject,
            name: 'accessibility',
            testDir: './tests/accessibility',
        },
        {
            ...chromiumProject,
            name: 'screenshot',
            testDir: './tests/screenshot',
            expect: {
                toHaveScreenshot: {
                    pathTemplate:
                        '{testDir}/{testFileDir}/__snapshots__/{arg}-chromium{ext}',
                },
            },
        },
    ],
} );

export default config;
