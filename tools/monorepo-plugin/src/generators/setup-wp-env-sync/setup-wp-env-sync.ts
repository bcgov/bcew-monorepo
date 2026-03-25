import {
    formatFiles,
    generateFiles,
    Tree,
    readJson,
    writeJson,
} from '@nx/devkit';
import * as path from 'path';
import { SetupWpEnvSyncSchema } from './schema';

/**
 * Migration generator to set up centralized wp-env version management.
 * Creates tools/wp-env/ infrastructure and wires it into the workspace.
 * @param {Tree}                 tree    Filesystem tree.
 * @param {SetupWpEnvSyncSchema} options Options from schema.json.
 */
export const setupWpEnvSync = async (
    tree: Tree,
    options: SetupWpEnvSyncSchema
) => {
    const wordPressVersion =
        options.wordPressVersion || 'WordPress/WordPress#6.8';
    const phpVersion = options.phpVersion || '7.4';

    // Generate files from template
    generateFiles( tree, path.join( __dirname, 'files' ), '', {
        wordPressVersion,
        phpVersion,
    } );

    // Update package.json to add wp-env:sync script
    const packageJson = readJson( tree, 'package.json' );
    if ( ! packageJson.scripts ) {
        packageJson.scripts = {};
    }
    packageJson.scripts[ 'wp-env:sync' ] = 'node tools/wp-env/cli.js';
    writeJson( tree, 'package.json', packageJson );

    // Update nx.json to add a wp-env-sync target
    const nxJson = readJson( tree, 'nx.json' );

    if ( ! nxJson.targetDefaults ) {
        nxJson.targetDefaults = {};
    }

    // Add wp-env-sync target (runs the sync script)
    nxJson.targetDefaults[ 'wp-env-sync' ] = {
        executor: 'nx:run-commands',
        options: {
            command: 'node tools/wp-env/cli.js',
        },
    };

    writeJson( tree, 'nx.json', nxJson );

    await formatFiles( tree );
};

export default setupWpEnvSync;
