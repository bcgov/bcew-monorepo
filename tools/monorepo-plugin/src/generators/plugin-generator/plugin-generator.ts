import {
    addProjectConfiguration,
    formatFiles,
    generateFiles,
    Tree,
} from '@nx/devkit';
import * as path from 'path';
import { PluginGeneratorGeneratorSchema } from './schema';

export async function pluginGeneratorGenerator(
    tree: Tree,
    options: PluginGeneratorGeneratorSchema
) {
    const projectRoot = `plugins/${options.slug}`;
    addProjectConfiguration(tree, options.slug, {
        root: projectRoot,
        projectType: 'application',
        sourceRoot: `${ projectRoot }/src`,
        targets: {},
    });
    generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
    await formatFiles(tree);
}

export default pluginGeneratorGenerator;
