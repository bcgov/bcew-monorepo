import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { themeGeneratorGenerator } from './theme-generator';
import { ThemeGeneratorGeneratorSchema } from './schema';

describe( 'theme-generator generator', () => {
    let tree: Tree;
    const options: ThemeGeneratorGeneratorSchema = { name: 'test' };

    beforeEach( () => {
        tree = createTreeWithEmptyWorkspace();
    } );

    it( 'should run successfully', async () => {
        await themeGeneratorGenerator( tree, options );
        const config = readProjectConfiguration( tree, 'test' );
        expect( config ).toBeDefined();
    } );
} );
