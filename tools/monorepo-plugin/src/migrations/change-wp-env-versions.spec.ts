import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { readJson, Tree, writeJson } from '@nx/devkit';

import update from './change-wp-env-versions';

describe('changePhpAndWpVersions migration', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
    });

    it('should update every .wp-env.json under plugins, themes, generators, and root', async () => {
        writeJson(tree, 'plugins/my-plugin/.wp-env.json', {
            core: 'WordPress/WordPress#6.7',
            phpVersion: '8.2',
            plugins: ['.'],
        });

        writeJson(tree, 'themes/my-theme/.wp-env.json', {
            core: 'WordPress/WordPress#6.6',
            phpVersion: '8.1',
        });

        writeJson(tree, 'tools/monorepo-plugin/src/generators/plugin/files/.wp-env.json', {
            core: 'WordPress/WordPress#6.5',
            phpVersion: '8.0',
        });

        writeJson(tree, '.wp-env.json', {
            core: 'WordPress/WordPress#6.0',
            phpVersion: '8.3',
        });

        await update(tree);

        const pluginWpEnv = readJson<Record<string, unknown>>(
            tree,
            'plugins/my-plugin/.wp-env.json'
        );
        const themeWpEnv = readJson<Record<string, unknown>>(
            tree,
            'themes/my-theme/.wp-env.json'
        );
        const generatorWpEnv = readJson<Record<string, unknown>>(
            tree,
            'tools/monorepo-plugin/src/generators/plugin/files/.wp-env.json'
        );
        const rootWpEnv = readJson<Record<string, unknown>>(tree, '.wp-env.json');

        expect(pluginWpEnv.core).toEqual('WordPress/WordPress#6.8');
        expect(pluginWpEnv.phpVersion).toEqual('7.4');

        expect(themeWpEnv.core).toEqual('WordPress/WordPress#6.8');
        expect(themeWpEnv.phpVersion).toEqual('7.4');

        expect(generatorWpEnv.core).toEqual('WordPress/WordPress#6.8');
        expect(generatorWpEnv.phpVersion).toEqual('7.4');

        expect(rootWpEnv.core).toEqual('WordPress/WordPress#6.8');
        expect(rootWpEnv.phpVersion).toEqual('7.4');
    });
});
