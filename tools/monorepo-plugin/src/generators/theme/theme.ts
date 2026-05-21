import {
    addProjectConfiguration,
    formatFiles,
    generateFiles,
    Tree,
} from '@nx/devkit';
import * as path from 'path';
import { ThemeGeneratorSchema } from './schema';
import { updateLabeler } from '../helpers';
import { getNextWpEnvPorts } from '../wp-env-ports';

/**
 * Generates a WordPress theme.
 * @param {Tree}                 tree    Filesystem tree.
 * @param {ThemeGeneratorSchema} options Options from schema.json.
 */
export const themeGenerator = async (
    tree: Tree,
    options: ThemeGeneratorSchema
) => {
    const projectRoot = `themes/${ options.slug }`;
    const wpEnvPort = options.wpEnvPort ?? getNextWpEnvPorts( tree ).port;
    // Todo: Detect existing project and update instead of initializing new project.
    // @see https://nx.dev/docs/extending-nx/migration-generators
    const phpNamespace = options.slug
        .split( '-' )
        .map( ( part ) => part.charAt( 0 ).toUpperCase() + part.slice( 1 ) )
        .join( '' );

    addProjectConfiguration( tree, options.slug, {
        root: projectRoot,
        projectType: 'application',
        sourceRoot: `${ projectRoot }/src`,
        targets: {},
    } );
    generateFiles( tree, path.join( __dirname, 'files' ), projectRoot, {
        ...options,
        phpNamespace,
        wpEnvPort,
    } );
    updateLabeler( tree, options.slug );
    await formatFiles( tree );
};

export default themeGenerator;
