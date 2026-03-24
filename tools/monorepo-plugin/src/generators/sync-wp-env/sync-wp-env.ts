import * as fs from 'node:fs';
import * as path from 'node:path';
import { formatFiles, Tree } from '@nx/devkit';
import { SyncWpEnvGeneratorSchema } from './schema';

const WP_ENV_FILE_NAME = '.wp-env.json';

interface WpEnvVersionConfig {
    core: string;
    phpVersion: string;
}

// Reads the canonical wp-env versions used as defaults when generator options are omitted.
/**
 * @param {Tree} tree In-memory Nx file tree.
 * @return {WpEnvVersionConfig} Default core and PHP versions.
 */
const getDefaultWpEnvVersionConfig = ( tree: Tree ): WpEnvVersionConfig => {
    const configPath = 'tools/wp-env/config.json';
    const fileContent = tree.read( configPath );

    if ( ! fileContent ) {
        throw new Error(
            `Missing wp-env version config at "${ configPath }". ` +
                'Ensure this file exists so default core/PHP versions can be determined.'
        );
    }

    return JSON.parse( fileContent.toString() ) as WpEnvVersionConfig;
};

// Recursively finds .wp-env.json files under a directory in the virtual Nx tree.
// This lets us keep generator templates in sync alongside real projects.
/**
 * @param {Tree}   tree          In-memory Nx file tree.
 * @param {string} directoryPath Directory to scan recursively.
 * @return {string[]} Matched .wp-env.json file paths.
 */
const collectWpEnvFiles = ( tree: Tree, directoryPath: string ): string[] => {
    if ( ! tree.exists( directoryPath ) ) {
        return [];
    }

    const wpEnvFiles: string[] = [];

    for ( const child of tree.children( directoryPath ) ) {
        const childPath = `${ directoryPath }/${ child }`;

        if ( child === WP_ENV_FILE_NAME ) {
            wpEnvFiles.push( childPath );
            continue;
        }

        if ( tree.isFile( childPath ) ) {
            continue;
        }

        wpEnvFiles.push( ...collectWpEnvFiles( tree, childPath ) );
    }

    return wpEnvFiles;
};

// Applies the selected core/PHP versions to one wp-env file while preserving all other keys.
/**
 * @param {Tree}               tree          In-memory Nx file tree.
 * @param {string}             filePath      Path to a .wp-env.json file.
 * @param {WpEnvVersionConfig} versionConfig Versions to apply.
 * @return {boolean} True when the file was updated.
 */
const updateWpEnvFile = (
    tree: Tree,
    filePath: string,
    versionConfig: WpEnvVersionConfig
) => {
    const fileContent = tree.read( filePath );
    if ( ! fileContent ) {
        return false;
    }

    const config = JSON.parse( fileContent.toString() );

    config.core = versionConfig.core;
    config.phpVersion = versionConfig.phpVersion;

    tree.write( filePath, `${ JSON.stringify( config, null, 4 ) }\n` );
    return true;
};

/**
 * @param {Tree}                     tree    In-memory Nx file tree.
 * @param {SyncWpEnvGeneratorSchema} options Generator CLI options.
 * @return {Promise<void>} Resolves when updates and formatting are complete.
 */
export const syncWpEnvGenerator = async (
    tree: Tree,
    options: SyncWpEnvGeneratorSchema
) => {
    // Merge explicit CLI options over defaults so callers can override per run.
    const defaultVersionConfig = getDefaultWpEnvVersionConfig();
    const versionConfig: WpEnvVersionConfig = {
        core: options.core ?? defaultVersionConfig.core,
        phpVersion: String(
            options.phpVersion ?? defaultVersionConfig.phpVersion
        ),
    };

    const filesToUpdate = new Set< string >();

    // Update top-level plugin/theme projects that own their own wp-env config.
    const packageRoots = [ 'themes', 'plugins' ];
    for ( const packageRoot of packageRoots ) {
        if ( ! tree.exists( packageRoot ) ) {
            continue;
        }

        const projects = tree.children( packageRoot );
        for ( const project of projects ) {
            const wpEnvPath = `${ packageRoot }/${ project }/${ WP_ENV_FILE_NAME }`;
            if ( tree.exists( wpEnvPath ) ) {
                filesToUpdate.add( wpEnvPath );
            }
        }
    }

    // Keep generator template files aligned so newly generated projects use the same versions.
    for ( const templateWpEnvPath of collectWpEnvFiles(
        tree,
        'tools/monorepo-plugin/src/generators'
    ) ) {
        filesToUpdate.add( templateWpEnvPath );
    }

    // Optionally sync the repo root wp-env config as part of the same operation.
    if ( options.includeRoot ?? true ) {
        const rootWpEnvPath = WP_ENV_FILE_NAME;
        if ( tree.exists( rootWpEnvPath ) ) {
            filesToUpdate.add( rootWpEnvPath );
        }
    }

    // Apply changes across all discovered files in a single generator run.
    for ( const filePath of filesToUpdate ) {
        updateWpEnvFile( tree, filePath, versionConfig );
    }

    // Normalize formatting after writes for clean diffs.
    await formatFiles( tree );
};

export default syncWpEnvGenerator;
