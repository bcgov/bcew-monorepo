import { defineConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Parse .wp-env.json and set WP_BASE_URL BEFORE importing baseConfig
// so that @wordpress/scripts' global-setup reads the correct port.
const getConfigDirectoryFromArgv = () => {
    const configFlagIndex = process.argv.findIndex( ( argument ) =>
        argument.startsWith( '--config' )
    );

    if ( -1 === configFlagIndex ) {
        return undefined;
    }

    const configFlag = process.argv[ configFlagIndex ];
    const configPath = configFlag.includes( '=' )
        ? configFlag.split( '=' )[ 1 ]
        : process.argv[ configFlagIndex + 1 ];

    if ( ! configPath ) {
        return undefined;
    }

    const absoluteConfigPath = path.isAbsolute( configPath )
        ? configPath
        : path.resolve( process.cwd(), configPath );

    return path.dirname( absoluteConfigPath );
};

const resolveWpEnvPathEarly = () => {
    const configDirectory = getConfigDirectoryFromArgv();

    if ( configDirectory ) {
        const configScopedWpEnvPath = path.join(
            configDirectory,
            '.wp-env.json'
        );

        if ( fs.existsSync( configScopedWpEnvPath ) ) {
            return configScopedWpEnvPath;
        }
    }

    const cwdWpEnvPath = path.join( process.cwd(), '.wp-env.json' );

    return fs.existsSync( cwdWpEnvPath ) ? cwdWpEnvPath : undefined;
};

// Set WP_BASE_URL in environment BEFORE importing baseConfig
// and capture storageStatePath early before argv changes in worker processes
if ( ! process.env.WP_BASE_URL ) {
    const wpEnvPath = resolveWpEnvPathEarly();
    if ( wpEnvPath ) {
        try {
            const wpEnv = JSON.parse( fs.readFileSync( wpEnvPath, 'utf8' ) );
            const testsPort = wpEnv.testsPort || wpEnv.port;
            if ( testsPort ) {
                process.env.WP_BASE_URL = `http://localhost:${ testsPort }`;
            }
        } catch {
            // Ignore parse errors
        }
    }
}

// Capture config directory early while argv is still available
// and store in env so it persists across worker imports
if ( ! process.env.PLAYWRIGHT_CONFIG_DIR ) {
    const earlyConfigDir = getConfigDirectoryFromArgv() || process.cwd();
    process.env.PLAYWRIGHT_CONFIG_DIR = earlyConfigDir;
}

const storageStatePath = path.join(
    process.env.PLAYWRIGHT_CONFIG_DIR,
    'artifacts',
    'storage-states',
    'admin.json'
);

import baseConfig from '@wordpress/scripts/config/playwright.config.js';

const resolveWpEnvPath = () => {
    const configDirectory = getConfigDirectoryFromArgv();

    if ( configDirectory ) {
        const configScopedWpEnvPath = path.join(
            configDirectory,
            '.wp-env.json'
        );

        if ( fs.existsSync( configScopedWpEnvPath ) ) {
            return configScopedWpEnvPath;
        }
    }

    const cwdWpEnvPath = path.join( process.cwd(), '.wp-env.json' );

    return fs.existsSync( cwdWpEnvPath ) ? cwdWpEnvPath : undefined;
};

const resolveWpBaseUrl = () => {
    if ( process.env.WP_BASE_URL ) {
        return process.env.WP_BASE_URL;
    }

    const wpEnvPath = resolveWpEnvPath();

    if ( ! wpEnvPath ) {
        return undefined;
    }

    try {
        const wpEnv = JSON.parse( fs.readFileSync( wpEnvPath, 'utf8' ) );

        const testsPort = wpEnv.testsPort || wpEnv.port;

        if ( ! testsPort ) {
            return undefined;
        }

        return `http://localhost:${ testsPort }`;
    } catch {
        return undefined;
    }
};

const wpBaseUrl = resolveWpBaseUrl();
const normalizedBaseUrl = wpBaseUrl
    ? new URL( wpBaseUrl, 'http://localhost' ).href
    : undefined;
const resolvedPort = normalizedBaseUrl
    ? Number( new URL( normalizedBaseUrl ).port )
    : undefined;

// Note: storageStatePath is already captured early (at module load time)
// before argv changes in worker processes. Don't recompute it here.

const config = defineConfig( {
    ...baseConfig,
    testDir: 'tests/e2e',
    use: {
        ...baseConfig.use,
        ...( normalizedBaseUrl ? { baseURL: normalizedBaseUrl } : {} ),
        storageState: storageStatePath,
    },
    webServer:
        resolvedPort && baseConfig.webServer
            ? {
                  ...baseConfig.webServer,
                  port: resolvedPort,
              }
            : baseConfig.webServer,
} );

export default config;
