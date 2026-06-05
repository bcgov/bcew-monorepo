import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'icon editor visual regression', () => {
    const BLOCK_NAME = 'bcew-blocks/icon';
    const BLOCK_CLASS = '.wp-block-bcew-blocks-icon';

    const setupSelectedIconBlock = async ( { admin, editor, page } ) => {
        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );

        const block = editor.canvas
            .locator( `[data-type="${ BLOCK_NAME }"]` )
            .first();
        await expect( block ).toBeVisible();
        await block.click();

        const inspectorPanel = page
            .locator( '.components-panel__body' )
            .filter( { hasText: 'Pick an icon' } )
            .first();
        await expect( inspectorPanel ).toBeVisible();

        return { inspectorPanel };
    };

    test( 'filter house and select icon in settings', async ( {
        admin,
        editor,
        page,
    } ) => {
        const { inspectorPanel } = await setupSelectedIconBlock( {
            admin,
            editor,
            page,
        } );

        await page.getByPlaceholder( 'Search icons' ).fill( 'house' );
        await page.getByRole( 'button', { name: 'House' } ).click();

        await expect( inspectorPanel ).toHaveScreenshot(
            'icon-editor-filter-house-selected.png'
        );
    } );

    test( 'selected icon shown in editor block and settings', async ( {
        admin,
        editor,
        page,
    } ) => {
        await setupSelectedIconBlock( {
            admin,
            editor,
            page,
        } );

        await page.getByPlaceholder( 'Search icons' ).fill( 'house' );
        await page.getByRole( 'button', { name: 'House' } ).click();

        const editorSurface = page.locator( '.edit-post-layout' ).first();
        await expect( editorSurface ).toHaveScreenshot(
            'icon-editor-selected-house-canvas-and-settings.png'
        );

        await expect(
            editor.canvas.locator( BLOCK_CLASS ).first()
        ).toBeVisible();
    } );
} );
