import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { themeGenerator } from './theme';
import { ThemeGeneratorSchema } from './schema';

describe( 'theme generator', () => {
    let tree: Tree;
    const options: ThemeGeneratorSchema = {
        name: 'Test Theme',
        slug: 'test-theme',
        parentTheme: 'none',
    };

    beforeEach( () => {
        tree = createTreeWithEmptyWorkspace();
    } );

    it( 'should run successfully', async () => {
        await themeGenerator( tree, options );
        const config = readProjectConfiguration( tree, 'test-theme' );
        expect( config ).toBeDefined();
    } );

    it( 'should assign the next wp-env ports automatically', async () => {
        tree.write(
            'themes/existing/.wp-env.json',
            JSON.stringify( { port: 9006, testsPort: 9007 }, null, 4 )
        );

        await themeGenerator( tree, options );

        const wpEnvConfig = JSON.parse(
            tree.read( 'themes/test-theme/.wp-env.json' )!.toString()
        );

        expect( wpEnvConfig.port ).toBe( 9008 );
        expect( wpEnvConfig.testsPort ).toBe( 9009 );
    } );
} );
