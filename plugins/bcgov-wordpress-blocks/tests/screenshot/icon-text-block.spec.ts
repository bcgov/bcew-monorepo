import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { FrameLocator, Locator, Page } from '@playwright/test';

const fillBlock = async ( locator: Locator, text: string ) => {
    await expect( locator ).toBeVisible();
    await locator.fill( text );
};

const insertAndSelectIconBlock = async (
    editor: {
        insertBlock: ( block: { name: string } ) => Promise< void >;
        canvas: FrameLocator;
    },
    blockName: string
) => {
    await editor.insertBlock( { name: blockName } );
    const iconBlock = editor.canvas
        .locator( '[data-type="bcew-blocks/icon"]' )
        .first();

    await expect( iconBlock ).toBeVisible();
    return iconBlock;
};

const chooseHouseIcon = async ( iconBlock: Locator, page: Page ) => {
    await iconBlock.click();
    await expect(
        page.getByText( 'Pick an icon', { exact: true } )
    ).toBeVisible();
    await fillBlock( page.getByPlaceholder( 'Search icons' ), 'house' );
    await page.getByRole( 'button', { name: 'House', exact: true } ).click();
    await expect(
        iconBlock.locator( 'i.bcgov-wp-blocks-icon__preview' )
    ).toHaveClass( /fa-house/ );
};

const fillIconTextBlockContent = async ( canvas: FrameLocator ) => {
    // Fill required fields so the fixed-height block always renders meaningful content.
    await fillBlock(
        canvas.getByRole( 'document', { name: 'Block: Heading' } ).first(),
        'Icon & Text Block'
    );
    await fillBlock(
        canvas.getByRole( 'textbox', { name: 'List text' } ).first(),
        'list item'
    );
    await fillBlock(
        canvas.getByRole( 'textbox', { name: 'Button text' } ).first(),
        'CTA Link Button'
    );
};

const captureResponsiveScreenshots = async (
    previewPage: Page,
    preview: Locator,
    snapshots: ReadonlyArray< {
        name: string;
        viewport: { width: number; height: number };
    } >
) => {
    for ( const snapshot of snapshots ) {
        await previewPage.setViewportSize( snapshot.viewport );
        await expect( preview ).toHaveScreenshot(
            `icon-text-block-${ snapshot.name }.png`
        );
    }
};

test.describe( 'icon-text-block visual regression', () => {
    const BLOCK_NAME = 'bcew-blocks/icon-text-block';
    const BLOCK_CLASS = '.wp-block-bcew-blocks-icon-text-block';
    const SCREENSHOT_SNAPSHOTS = [
        {
            name: 'desktop',
            viewport: { width: 1400, height: 900 },
        },
        {
            name: 'mobile',
            viewport: { width: 390, height: 844 },
        },
    ] as const;

    // Set up the test environment before each test and clean up after all tests.
    test.beforeEach( async ( { admin } ) => {
        await admin.createNewPost();
    } );
    test.afterAll( async ( { requestUtils } ) => {
        await requestUtils.deleteAllPosts();
    } );

    test( 'Icon / Text block renders correctly in desktop and mobile views', async ( {
        editor,
        page,
    } ) => {
        const iconBlock = await insertAndSelectIconBlock( editor, BLOCK_NAME );
        await chooseHouseIcon( iconBlock, page );
        await fillIconTextBlockContent( editor.canvas );

        const previewPage = await editor.openPreviewPage();
        const preview = previewPage.locator( BLOCK_CLASS ).first();
        await expect( preview ).toBeVisible();

        await captureResponsiveScreenshots(
            previewPage,
            preview,
            SCREENSHOT_SNAPSHOTS
        );
    } );
} );
