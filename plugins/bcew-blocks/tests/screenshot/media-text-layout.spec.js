import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import path from 'node:path';

test.describe( 'media-text-layout visual regression', () => {
    const BLOCK_NAME = 'bcew-blocks/media-text-layout';
    const BLOCK_CLASS = '.wp-block-bcew-blocks-media-text-layout';
    const MOBILE_VIEWPORT = { width: 390, height: 844 };
    const IMAGE_PATH = path.resolve(
        process.cwd(),
        'assets/images/square-512.png'
    );

    test.beforeEach( async ( { admin } ) => {
        await admin.createNewPost();
    } );

    test( 'Media & Text Layout block renders correctly in desktop and mobile views', async ( {
        editor,
        requestUtils,
    } ) => {
        const media = await requestUtils.uploadMedia( IMAGE_PATH );
        await editor.insertBlock( {
            name: BLOCK_NAME,
            attributes: { imageId: media.id },
        } );

        const heading = editor.canvas
            .getByRole( 'document', { name: 'Block: Heading' } )
            .first();
        await expect( heading ).toBeVisible();
        await heading.fill( 'Media & Text Layout' );

        const list = editor.canvas
            .getByRole( 'textbox', { name: 'List text' } )
            .first();
        await expect( list ).toBeVisible();
        await list.fill( 'list item' );

        const button = editor.canvas
            .getByRole( 'textbox', { name: 'Button text' } )
            .first();
        await expect( button ).toBeVisible();
        await button.fill( 'CTA Link Button' );

        const previewPage = await editor.openPreviewPage();
        const preview = previewPage.locator( BLOCK_CLASS ).first();
        await expect( preview ).toBeVisible();

        // Capture a screenshot of the block in its default desktop view for visual regression testing.
        await expect( preview ).toHaveScreenshot(
            'media-text-layout-desktop.png'
        );
        // Set the viewport to a mobile size and capture another screenshot for mobile view testing.
        await previewPage.setViewportSize( MOBILE_VIEWPORT );
        await expect( preview ).toHaveScreenshot(
            'media-text-layout-mobile.png'
        );
    } );
} );
