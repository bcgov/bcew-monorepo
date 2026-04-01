import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree } from '@nx/devkit';

import { blockVersionUpdateGenerator } from './block-version-update';
import { BlockVersionUpdateGeneratorSchema } from './schema';

describe( 'block-version-update generator', () => {
    let tree: Tree;
    const options: BlockVersionUpdateGeneratorSchema = { version: '1.2.7' };

    beforeEach( () => {
        tree = createTreeWithEmptyWorkspace();
        // Create mock plugin structure with block.json files
        tree.write(
            'plugins/test-plugin/src/sample-block/block.json',
            JSON.stringify( { version: '1.0.0' }, null, 2 )
        );
        tree.write(
            'plugins/another-plugin/src/another-block/block.json',
            JSON.stringify( { version: '1.0.0' }, null, 2 )
        );
    } );

    it( 'should update all block.json version fields', async () => {
        await blockVersionUpdateGenerator( tree, options );

        const firstBlockJson = JSON.parse(
            tree
                .read( 'plugins/test-plugin/src/sample-block/block.json' )!
                .toString()
        );
        const secondBlockJson = JSON.parse(
            tree
                .read( 'plugins/another-plugin/src/another-block/block.json' )!
                .toString()
        );

        expect( firstBlockJson.version ).toBe( '1.2.7' );
        expect( secondBlockJson.version ).toBe( '1.2.7' );
    } );

    it( 'should handle missing plugins directory gracefully', async () => {
        // Test with empty workspace (no plugins directory)
        const emptyTree = createTreeWithEmptyWorkspace();
        await expect(
            blockVersionUpdateGenerator( emptyTree, options )
        ).rejects.toThrow( 'No block.json files found to update.' );
    } );
} );
