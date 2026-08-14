const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

const BLOCK_NAME = 'bcew-chefs-embed/chefs-form';

test.describe( 'chefs-form block', () => {
    test( 'should be visible', async ( { admin, editor } ) => {
        await admin.createNewPost();

        await editor.insertBlock( {
            name: BLOCK_NAME,
        } );

        const block = editor.canvas.locator( `[data-type="${ BLOCK_NAME }"]` );

        await expect( block ).toBeVisible();

        await expect( block ).toHaveScreenshot();
    } );
} );
