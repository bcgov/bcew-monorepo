const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

const BLOCK_NAME = 'bcew-chefs-embed/chefs-form';

test.describe( 'CHEFS Form block', () => {
    test( 'can be inserted from the block editor', async ( {
        admin,
        editor,
    } ) => {
        await admin.createNewPost();

        await editor.insertBlock( {
            name: BLOCK_NAME,
        } );

        const block = editor.canvas.locator( `[data-type="${ BLOCK_NAME }"]` );

        await expect( block ).toBeVisible();
    } );

    test( 'has a formId attribute', async ( { admin, editor } ) => {
        await admin.createNewPost();

        await editor.insertBlock( {
            name: BLOCK_NAME,
        } );

        const blocks = await editor.getBlocks();

        const chefsBlock = blocks.find(
            ( block ) => block.name === BLOCK_NAME
        );

        expect( chefsBlock ).toBeDefined();
        expect( chefsBlock.attributes.formId ).toBeDefined();
    } );
} );
