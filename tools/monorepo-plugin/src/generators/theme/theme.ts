import {
    addProjectConfiguration,
    formatFiles,
    generateFiles,
    Tree,
} from '@nx/devkit';
import * as path from 'path';
import { ThemeGeneratorSchema } from './schema';
import { updateLabeler } from '../helpers';

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
    // Todo: Detect existing project and update instead of initializing new project.
    // @see https://nx.dev/docs/extending-nx/migration-generators
    addProjectConfiguration( tree, options.slug, {
        root: projectRoot,
        projectType: 'application',
        sourceRoot: `${ projectRoot }/src`,
        targets: {},
    } );
    generateFiles(
        tree,
        path.join( __dirname, 'files' ),
        projectRoot,
        options
    );
    updateLabeler( tree, options );
    await formatFiles( tree );
};

export default themeGenerator;
