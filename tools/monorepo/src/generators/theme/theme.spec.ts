import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { themeGenerator } from './theme';
import { ThemeGeneratorSchema } from './schema';

describe( 'theme generator', () => {
    let tree: Tree;
    const options: ThemeGeneratorSchema = {
        name: 'Test Theme',
        parentTheme: 'none',
    };

    beforeEach( () => {
        tree = createTreeWithEmptyWorkspace();
    } );

    it( 'should run successfully', async () => {
        await themeGenerator( tree, options );
        const config = readProjectConfiguration( tree, 'test-theme' );
        expect( config ).toBeDefined();
        expect( config.targets?.[ 'test-accessibility' ] ).toBeDefined();
        expect(
            tree.read( 'themes/test-theme/playwright.config.js' )?.toString()
        ).toContain(
            "export { default } from '@bcew-monorepo/e2e/playwright.config.js';"
        );
        expect(
            tree.exists( 'themes/test-theme/playwright.regression.config.js' )
        ).toBe( false );
    } );
} );
