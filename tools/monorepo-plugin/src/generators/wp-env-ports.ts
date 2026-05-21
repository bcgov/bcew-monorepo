import { Tree } from '@nx/devkit';

/** Default dev port when no .wp-env.json in the workspace defines one yet. */
export const DEFAULT_WP_ENV_PORT = 9002;

export interface WpEnvPorts {
    port: number;
    testsPort: number;
}

/**
 * Collect paths to every .wp-env.json file in the Nx workspace tree.
 *
 * @param {Tree}   tree Virtual filesystem tree.
 * @param {string} dir  Directory to scan (empty string for workspace root).
 * @return {string[]} Paths relative to the workspace root.
 */
export const collectWpEnvJsonPaths = ( tree: Tree, dir = '' ): string[] => {
    const paths: string[] = [];

    if ( ! tree.exists( dir ) ) {
        return paths;
    }

    for ( const child of tree.children( dir ) ) {
        const childPath = dir ? `${ dir }/${ child }` : child;

        if ( '.wp-env.json' === child && tree.isFile( childPath ) ) {
            paths.push( childPath );
            continue;
        }

        if ( tree.exists( childPath ) && ! tree.isFile( childPath ) ) {
            paths.push( ...collectWpEnvJsonPaths( tree, childPath ) );
        }
    }

    return paths;
};

/**
 * Read the highest port or testsPort value from all .wp-env.json files.
 *
 * @param {Tree} tree Virtual filesystem tree.
 * @return {number} Highest port found, or 0 when none are configured.
 */
export const findHighestWpEnvPort = ( tree: Tree ): number => {
    let highest = 0;

    for ( const filePath of collectWpEnvJsonPaths( tree ) ) {
        const contents = tree.read( filePath );
        if ( ! contents ) {
            continue;
        }

        let config: { port?: number; testsPort?: number };
        try {
            config = JSON.parse( contents.toString() ) as {
                port?: number;
                testsPort?: number;
            };
        } catch {
            continue;
        }

        if ( 'number' === typeof config.port && config.port > highest ) {
            highest = config.port;
        }

        if (
            'number' === typeof config.testsPort &&
            config.testsPort > highest
        ) {
            highest = config.testsPort;
        }
    }

    return highest;
};

/**
 * Determine the next wp-env port pair for a new plugin or theme.
 *
 * Uses the highest port or testsPort in the monorepo, then assigns the next
 * consecutive pair (e.g. 9005 in use → 9006 dev, 9007 tests).
 *
 * @param {Tree} tree Virtual filesystem tree.
 * @return {WpEnvPorts} Next dev and tests ports.
 */
export const getNextWpEnvPorts = ( tree: Tree ): WpEnvPorts => {
    const highest = findHighestWpEnvPort( tree );
    const port = highest > 0 ? highest + 1 : DEFAULT_WP_ENV_PORT;

    return {
        port,
        testsPort: port + 1,
    };
};
