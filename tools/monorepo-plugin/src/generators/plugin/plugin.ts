import {
    addProjectConfiguration,
    formatFiles,
    generateFiles,
    Tree,
} from '@nx/devkit';
import * as path from 'path';
import { PluginGeneratorSchema } from './schema';
import { updateLabeler, WordPressProjectType } from '../helpers';

/**
 * Generates a WordPress plugin.
 * @param {Tree}                  tree    Filesystem tree.
 * @param {PluginGeneratorSchema} options Options from schema.json.
 */
export const pluginGenerator = async (
    tree: Tree,
    options: PluginGeneratorSchema
) => {
    const slug = options.name
        .toLowerCase()
        .replace( /\s+/g, '-' )
        .replace( /[^a-z0-9-]/g, '' );
    const description = options.description ?? '';
    const projectRoot = `plugins/${ slug }`;
    const phpSafeSlug = slug.replace( /-/g, '_' );
    const phpNamespace = slug
        .split( '-' )
        .map( ( part ) => part.charAt( 0 ).toUpperCase() + part.slice( 1 ) )
        .join( '' );

    addProjectConfiguration( tree, slug, {
        root: projectRoot,
        projectType: 'application',
        sourceRoot: `${ projectRoot }/src`,
        targets: {},
    } );
    generateFiles( tree, path.join( __dirname, 'files' ), projectRoot, {
        ...options,
        slug,
        description,
        phpSafeSlug,
        phpNamespace,
    } );
    updateLabeler( tree, slug, WordPressProjectType.Plugin );
    await formatFiles( tree );
};

export default pluginGenerator;
