import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'icon visual regression', () => {
    const BLOCK_NAME = 'bcew-blocks/icon';
    const BLOCK_CLASS = '.wp-block-bcew-blocks-icon';

    test.beforeEach( async ( { admin } ) => {
        await admin.createNewPost();
    } );

    const openPreviewBlock = async ( editor ) => {
        const preview = ( await editor.openPreviewPage() )
            .locator( BLOCK_CLASS )
            .first();
        await expect( preview ).toBeVisible();
        return preview;
    };

    test( 'default rendering', async ( { editor } ) => {
        await editor.insertBlock( { name: BLOCK_NAME } );

        const preview = await openPreviewBlock( editor );
        await expect( preview ).toHaveScreenshot( 'icon-default.png' );
    } );

    test( 'selected icon in small size', async ( { editor, page } ) => {
        await editor.insertBlock( { name: BLOCK_NAME } );
        await page.getByRole( 'button', { name: 'House' } ).click();
        await page.getByLabel( 'Icon size' ).selectOption( 'small' );

        const preview = await openPreviewBlock( editor );
        await expect( preview ).toHaveScreenshot( 'icon-house-small.png' );
    } );

    test( 'selected icon in medium size', async ( { editor, page } ) => {
        await editor.insertBlock( { name: BLOCK_NAME } );
        await page.getByRole( 'button', { name: 'House' } ).click();
        await page.getByLabel( 'Icon size' ).selectOption( 'medium' );

        const preview = await openPreviewBlock( editor );
        await expect( preview ).toHaveScreenshot( 'icon-house-medium.png' );
    } );

    test( 'selected icon in large size', async ( { editor, page } ) => {
        await editor.insertBlock( { name: BLOCK_NAME } );
        await page.getByRole( 'button', { name: 'House' } ).click();
        await page.getByLabel( 'Icon size' ).selectOption( 'large' );

        const preview = await openPreviewBlock( editor );
        await expect( preview ).toHaveScreenshot( 'icon-house-large.png' );
    } );

    test( 'selected icon in xlarge size', async ( { editor, page } ) => {
        await editor.insertBlock( { name: BLOCK_NAME } );
        await page.getByRole( 'button', { name: 'House' } ).click();
        await page.getByLabel( 'Icon size' ).selectOption( 'xlarge' );

        const preview = await openPreviewBlock( editor );
        await expect( preview ).toHaveScreenshot( 'icon-house-xlarge.png' );
    } );
} );
