const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'chefs-form block', () => {
    test( 'should be visible', async ( { admin, editor } ) => {
        await admin.createNewPost();

        await editor.insertBlock( {
            name: 'bcew-chefs-embed/chefs-form',
        } );

        const block = editor.canvas.locator(
            '[data-type="bcew-chefs-embed/chefs-form"]'
        );

        await expect( block ).toBeVisible();

        await expect( block ).toHaveScreenshot();
    } );
} );
