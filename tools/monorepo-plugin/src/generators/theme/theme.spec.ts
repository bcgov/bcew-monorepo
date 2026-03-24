import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { themeGenerator } from './theme';
import { ThemeGeneratorSchema } from './schema';

describe( 'theme generator', () => {
    let tree: Tree;
    const options: ThemeGeneratorSchema = { name: 'test' };

    beforeEach( () => {
        tree = createTreeWithEmptyWorkspace();
    } );

    it( 'should run successfully', async () => {
        await themeGenerator( tree, options );
        const config = readProjectConfiguration( tree, 'test' );
        expect( config ).toBeDefined();
    } );
} );
