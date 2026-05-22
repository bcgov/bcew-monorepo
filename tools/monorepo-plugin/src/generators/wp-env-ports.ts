import { Tree } from '@nx/devkit';

const DEFAULT_WP_ENV_PORT = 9002;

const SKIP_DIRS = new Set( [ 'node_modules', 'dist', '.git' ] );

type WpEnvConfig = {
    port?: number;
    testsPort?: number;
};

/**
 * Recursively collects paths to `.wp-env.json` files in the Nx tree.
 * @param {Tree}   tree Filesystem tree.
 * @param {string} dir  Directory to scan.
 * @return {string[]} Paths to `.wp-env.json` files.
 */
export const collectWpEnvJsonPaths = ( tree: Tree, dir = '' ): string[] => {
    const paths: string[] = [];

    for ( const child of tree.children( dir ) ) {
        const filePath = dir ? `${ dir }/${ child }` : child;

        if ( '.wp-env.json' === child && tree.isFile( filePath ) ) {
            paths.push( filePath );
            continue;
        }

        if ( ! tree.isFile( filePath ) && ! SKIP_DIRS.has( child ) ) {
            paths.push( ...collectWpEnvJsonPaths( tree, filePath ) );
        }
    }

    return paths;
};

/**
 * Finds the highest `port` or `testsPort` value across all `.wp-env.json` files.
 * @param {Tree} tree Filesystem tree.
 * @return {number} Highest port number found.
 */
export const findHighestWpEnvPort = ( tree: Tree ): number => {
    let highest = DEFAULT_WP_ENV_PORT - 1;

    for ( const path of collectWpEnvJsonPaths( tree ) ) {
        const content = tree.read( path );

        if ( ! content ) {
            continue;
        }

        const config = JSON.parse( content.toString() ) as WpEnvConfig;

        if ( 'number' === typeof config.port ) {
            highest = Math.max( highest, config.port );
        }

        if ( 'number' === typeof config.testsPort ) {
            highest = Math.max( highest, config.testsPort );
        }
    }

    return highest;
};

/**
 * Returns the next available wp-env port pair for a new project.
 * @param {Tree} tree Filesystem tree.
 * @return {{ port: number, testsPort: number }} Next dev and test ports.
 */
export const getNextWpEnvPorts = (
    tree: Tree
): { port: number; testsPort: number } => {
    const highest = findHighestWpEnvPort( tree );

    return {
        port: highest + 1,
        testsPort: highest + 2,
    };
};
