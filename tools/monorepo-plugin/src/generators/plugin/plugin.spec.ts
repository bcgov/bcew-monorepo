import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { pluginGenerator } from './plugin';
import { PluginGeneratorSchema } from './schema';

describe('plugin generator', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace();
    });

    it('should create a project config using a derived slug', async () => {
        const options: PluginGeneratorSchema = {
            name: 'Test Plugin',
            description: 'Test plugin description',
        };

        await pluginGenerator(tree, options);

        const config = readProjectConfiguration(tree, 'test-plugin');

        expect(config).toBeDefined();
        expect(config.root).toBe('plugins/test-plugin');
        expect(config.sourceRoot).toBe('plugins/test-plugin/src');
    });

    it('should sanitize the plugin slug from name input', async () => {
        const options: PluginGeneratorSchema = {
            name: 'My Plugin v2!',
            description: 'Description',
        };

        await pluginGenerator(tree, options);

        const config = readProjectConfiguration(tree, 'my-plugin-v2');

        expect(config.root).toBe('plugins/my-plugin-v2');
    });

    it('should default description to an empty string when omitted', async () => {
        const options: PluginGeneratorSchema = {
            name: 'No Description Plugin',
        };

        await pluginGenerator(tree, options);

        const packageJsonPath = 'plugins/no-description-plugin/package.json';
        const composerJsonPath = 'plugins/no-description-plugin/composer.json';
        const blockJsonPath = 'plugins/no-description-plugin/src/sample-block/block.json';
        const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());
        const composerJson = JSON.parse(tree.read(composerJsonPath)!.toString());
        const blockJson = JSON.parse(tree.read(blockJsonPath)!.toString());

        expect(packageJson.description).toBe('');
        expect(composerJson.description).toBe('');
        expect(blockJson.description).toBe('');
    });

    it('should generate php-safe function name and pascal case namespace', async () => {
        const options: PluginGeneratorSchema = {
            name: 'My Plugin v2',
            description: 'Description',
        };

        await pluginGenerator(tree, options);

        const phpFilePath = 'plugins/my-plugin-v2/my-plugin-v2.php';
        const composerJsonPath = 'plugins/my-plugin-v2/composer.json';
        const phpFileContent = tree.read(phpFilePath)!.toString();
        const composerJson = JSON.parse(tree.read(composerJsonPath)!.toString());

        expect(phpFileContent).toContain('function my_plugin_v2_init()');
        expect(phpFileContent).toContain("add_action( 'init', 'my_plugin_v2_init' );");
        expect(composerJson.autoload['psr-4']['Bcgov\\MyPluginV2\\']).toBe('src/');
    });
});
