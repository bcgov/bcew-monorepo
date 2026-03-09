import {
    addProjectConfiguration,
    formatFiles,
    generateFiles,
    Tree,
} from '@nx/devkit';
import * as path from 'path';
import { ThemeGeneratorGeneratorSchema } from './schema';

export async function themeGeneratorGenerator(
    tree: Tree,
    options: ThemeGeneratorGeneratorSchema
) {
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
    await formatFiles( tree );
}

export default themeGeneratorGenerator;
