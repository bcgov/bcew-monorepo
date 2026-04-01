import { formatFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { BlockVersionUpdateGeneratorSchema } from './schema';

/**
 * Recursively find all block.json files under a directory using Tree API.
 * @param {Tree}     tree  - The file system tree provided by Nx.
 * @param {string}   dir   - The directory to search in.
 * @param {string[]} found - Array to accumulate found file paths.
 * @return {string[]} Array of block.json file paths.
 */
const findBlockJsonFiles = (
    tree: Tree,
    dir: string,
    found: string[] = []
): string[] => {
    if ( ! tree.exists( dir ) ) {
        return found;
    }
    const children = tree.children( dir );
    for ( const child of children ) {
        const fullPath = path.join( dir, child );
        if ( tree.isFile( fullPath ) && 'block.json' === child ) {
            found.push( fullPath );
        } else if ( tree.children( fullPath ).length > 0 ) {
            // Assume it's a directory if it has children
            findBlockJsonFiles( tree, fullPath, found );
        }
    }
    return found;
};

/**
 * Updates the version field in all block.json files across all plugins in the monorepo.
 * @param {Tree}                              tree    - The file system tree provided by Nx.
 * @param {BlockVersionUpdateGeneratorSchema} options - The generator options containing the new version.
 */
export const blockVersionUpdateGenerator = async (
    tree: Tree,
    options: BlockVersionUpdateGeneratorSchema
): Promise< void > => {
    // Find all plugins in the plugins directory
    const pluginsDir = 'plugins';
    const pluginFolders = tree.children( pluginsDir ).filter( ( name ) => {
        const fullPath = path.join( pluginsDir, name );
        return tree.exists( fullPath ) && tree.children( fullPath ).length > 0;
    } );

    let updatedFiles = 0;
    for ( const plugin of pluginFolders ) {
        const srcDir = path.join( pluginsDir, plugin, 'src' );
        const blockJsonFiles = findBlockJsonFiles( tree, srcDir );
        for ( const blockJsonPath of blockJsonFiles ) {
            if ( ! tree.exists( blockJsonPath ) ) {
                continue;
            }
            const content = tree.read( blockJsonPath, 'utf-8' );
            if ( ! content ) {
                continue;
            }
            try {
                const blockJson = JSON.parse( content );
                blockJson.version = options.version;
                tree.write(
                    blockJsonPath,
                    JSON.stringify( blockJson, null, 2 ) + '\n'
                );
                updatedFiles++;
            } catch ( e ) {
                // skip invalid JSON
                continue;
            }
        }
    }
    if ( 0 === updatedFiles ) {
        throw new Error( 'No block.json files found to update.' );
    }
    await formatFiles( tree );
};

export default blockVersionUpdateGenerator;
