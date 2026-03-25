import { readJson, Tree, visitNotIgnoredFiles, writeJson } from '@nx/devkit';

const TARGET_CORE_VERSION = 'WordPress/WordPress#6.8';
const TARGET_PHP_VERSION = '7.4';

/**
 * Checks whether a path is a .wp-env.json file that should be migrated.
 *
 * @param {string} filePath Relative file path in the Nx tree.
 * @return {boolean} True when the file should be updated by this migration.
 */
const shouldMigrateWpEnvFile = ( filePath: string ): boolean => {
    const isWpEnvFile =
        '.wp-env.json' === filePath || filePath.endsWith( '/.wp-env.json' );

    if ( ! isWpEnvFile ) {
        return false;
    }

    return (
        '.wp-env.json' === filePath ||
        filePath.startsWith( 'plugins/' ) ||
        filePath.startsWith( 'themes/' ) ||
        filePath.startsWith( 'tools/monorepo-plugin/src/generators/' )
    );
};

/**
 * Updates wp-env versions for targeted .wp-env.json files.
 *
 * @param {Tree} host Nx virtual file tree for the migration.
 * @return {void}
 */
const changePhpAndWpVersions = ( host: Tree ): void => {
    visitNotIgnoredFiles( host, '.', ( filePath ) => {
        if ( ! shouldMigrateWpEnvFile( filePath ) ) {
            return;
        }

        const wpEnvConfig = readJson< Record< string, unknown > >(
            host,
            filePath
        );
        wpEnvConfig.core = TARGET_CORE_VERSION;
        wpEnvConfig.phpVersion = TARGET_PHP_VERSION;
        writeJson( host, filePath, wpEnvConfig );
    } );
};

export default changePhpAndWpVersions;
