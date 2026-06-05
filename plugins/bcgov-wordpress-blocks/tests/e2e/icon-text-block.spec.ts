import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { FrameLocator, Locator, Page } from '@playwright/test';

const BLOCK_NAME = 'bcew-blocks/icon-text-block';
const BLOCK_CLASS = '.wp-block-bcew-blocks-icon-text-block';
const ICON_SIZES = [ 'small', 'medium', 'large', 'xlarge' ] as const;

test.describe( 'Icon/Text block — e2e', () => {
    test.beforeEach( async ( { admin } ) => await admin.createNewPost() );
    test.afterAll(
        async ( { requestUtils } ) => await requestUtils.deleteAllPosts()
    );

    test( 'publishes Icon/Text with House icon and top layout', async ( {
        editor,
        page,
    } ) => {
        const block = await insertBlock( editor );
        await pickHouse( block, page );

        // switch to top layout
        const parentButton = page.getByRole( 'button', {
            name: /Select parent block: Icon Text Block/i,
        } );
        if ( ( await parentButton.count() ) > 0 ) {
            await parentButton.first().click();
        } else {
            await block.click();
        }
        await page
            .getByRole( 'radio', { name: 'Icon top, content below' } )
            .check();

        // assert that the layout change is reflected in the block's class list before publishing
        await expect( block ).toHaveClass( /is-layout-icon-top/ );
        await fillContent( editor.canvas );
        const postId = await editor.publishPost();
        expect( postId ).not.toBeNull();
        await assertFrontend( postId as number, page );
    } );

    test( 'switches nested icon sizes via inspector', async ( {
        editor,
        page,
    } ) => {
        const block = await insertBlock( editor );
        await pickHouse( block, page );
        await fillContent( editor.canvas );
        for ( const sizeValue of ICON_SIZES ) {
            await chooseSize( block, page, sizeValue );
        }
    } );
} );

// Lower-level helpers (constants)
const insertBlock = async ( editor: {
    insertBlock: any;
    canvas: FrameLocator;
} ) => {
    await editor.insertBlock( { name: BLOCK_NAME } );
    const block = editor.canvas
        .locator( `[data-type="${ BLOCK_NAME }"]` )
        .first();
    await expect( block ).toBeVisible();
    return block;
};

const pickHouse = async ( block: Locator, page: Page ) => {
    await nestedIcon( block ).click();
    await expect(
        page.getByText( 'Pick an icon', { exact: true } )
    ).toBeVisible();
    await page.getByPlaceholder( 'Search icons' ).fill( 'house' );
    await page.getByRole( 'button', { name: 'House', exact: true } ).click();
    await expect(
        nestedIcon( block ).locator( 'i.bcgov-wp-blocks-icon__preview' )
    ).toHaveClass( /fa-house/ );
};

const fillContent = async ( canvas: FrameLocator ) => {
    // Fill heading like screenshot test so preview has meaningful title
    await canvas
        .getByRole( 'document', { name: 'Block: Heading' } )
        .first()
        .fill( 'Icon & Text Block' );

    await canvas
        .getByRole( 'textbox', { name: 'List text' } )
        .first()
        .fill( 'list item' );
    await canvas
        .getByRole( 'textbox', { name: 'Button text' } )
        .first()
        .fill( 'CTA Link Button' );
};

const chooseSize = async ( block: Locator, page: Page, size: string ) => {
    await nestedIcon( block ).click();
    const selectControl = page.getByLabel( 'Icon size' );
    await selectControl.click();
    const optionElement = selectControl.locator( `option[value="${ size }"]` );
    if ( await optionElement.isVisible() ) {
        await optionElement.click();
    } else {
        await selectControl.selectOption( { value: size } );
    }
    await expect( selectControl ).toHaveValue( size, { timeout: 10000 } );
    await expect( nestedIcon( block ) ).toHaveClass(
        new RegExp( `bcgov-wp-blocks-icon--size-${ size }` )
    );
};

const assertFrontend = async ( postId: number, page: Page ) => {
    await page.goto( `/?p=${ postId }` );
    const frontendBlock = page.locator( BLOCK_CLASS ).first();
    await expect( frontendBlock ).toBeVisible();
    await expect( frontendBlock ).toHaveClass( /is-layout-icon-top/ );
    await expect( frontendBlock.locator( 'i.fa-house' ) ).toBeVisible();
};

const nestedIcon = ( block: Locator ) =>
    block.locator( '[data-type="bcew-blocks/icon"]' ).first();
