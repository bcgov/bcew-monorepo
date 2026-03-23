import {
    addProjectConfiguration,
    formatFiles,
    generateFiles,
    Tree,
} from '@nx/devkit';
import * as path from 'path';
import { PluginGeneratorSchema } from './schema';

export async function pluginGenerator(
    tree: Tree,
    options: PluginGeneratorSchema
) {
    const slug = options.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    const description = options.description ?? '';
    const projectRoot = `plugins/${slug}`;
    const phpSafeSlug = slug.replace(/-/g, '_');
    const phpNamespace = slug
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    addProjectConfiguration(tree, slug, {
        root: projectRoot,
        projectType: 'application',
        sourceRoot: `${projectRoot}/src`,
        targets: {},
    });
    generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
        ...options,
        slug,
        description,
        phpSafeSlug,
        phpNamespace,
    });
    await formatFiles(tree);
}

export default pluginGenerator;
