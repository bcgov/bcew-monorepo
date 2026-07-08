import { test, expect, Editor } from '@wordpress/e2e-test-utils-playwright';
import type { Locator } from '@playwright/test';

/**
 * End-to-end "user journey" for the Cards block.
 *
 * A single flow that builds a row of Icon + Text cards, builds a second row of
 * Image + Text cards (exercising the content-type dropdown and the card-count
 * slider), publishes the post, and verifies both rows render correctly on the
 * frontend. This covers the `cards` and `card` blocks together with both of
 * their allowed content blocks from start to finish.
 */

const CARDS_BLOCK = 'bcew-blocks/cards';
const CARD_BLOCK = 'bcew-blocks/card';
const ICON_TEXT_BLOCK = 'bcew-blocks/icon-text-block';
const MEDIA_TEXT_BLOCK = 'bcew-blocks/media-text-layout';

const CARDS_CLASS = '.bcew-blocks-cards';
const CARD_CLASS = '.bcew-blocks-card';
const ICON_TEXT_CLASS = '.wp-block-bcew-blocks-icon-text-block';
// `media-text-layout` is a dynamic block: render.php emits the outer wrapper and
// save.js emits an inner `.inner-blocks` div that shares the block class. Match
// only the outer wrapper so each block counts once.
const MEDIA_TEXT_CLASS =
    '.wp-block-bcew-blocks-media-text-layout:not(.inner-blocks)';

const ICON_ROW = {
    count: 3,
    heading: 'Icon Journey Card',
    list: 'Icon journey list item',
    button: 'Icon journey CTA',
};
const MEDIA_ROW = {
    count: 2,
    heading: 'Image Journey Card',
    list: 'Image journey list item',
    button: 'Image journey CTA',
};

type RowContent = typeof ICON_ROW;

// Locator helpers ----------------------------------------------------------

const getCardsBlock = ( editor: Editor, index: number ): Locator =>
    editor.canvas.locator( `[data-type="${ CARDS_BLOCK }"]` ).nth( index );

const getNestedBlocks = ( cards: Locator, blockName: string ): Locator =>
    cards.locator( `[data-type="${ blockName }"]` );

// Inspector control helpers ------------------------------------------------

const setCardCount = async (
    editor: Editor,
    cards: Locator,
    count: number
): Promise< void > => {
    await editor.selectBlocks( cards );

    const countInput = editor.page.getByRole( 'spinbutton', {
        name: 'Number of cards',
    } );
    await expect( countInput ).toBeVisible();
    await countInput.fill( String( count ) );
    await countInput.press( 'Enter' );
};

const setContentType = async (
    editor: Editor,
    cards: Locator,
    value: string
): Promise< void > => {
    await editor.selectBlocks( cards );

    const typeSelect = editor.page.getByRole( 'combobox', {
        name: 'Content type',
    } );
    await expect( typeSelect ).toBeVisible();
    await typeSelect.selectOption( value );
};

// Content helpers ----------------------------------------------------------

const fillFirstCardContent = async (
    cards: Locator,
    content: RowContent
): Promise< void > => {
    const heading = cards
        .getByRole( 'document', { name: 'Block: Heading' } )
        .first();
    await expect( heading ).toBeVisible();
    await heading.fill( content.heading );

    const button = cards
        .getByRole( 'textbox', { name: 'Button text' } )
        .first();
    await expect( button ).toBeVisible();
    await button.fill( content.button );
};

// Frontend assertion helper ------------------------------------------------

const assertFrontendRow = async (
    row: Locator,
    nestedBlockClass: string,
    content: RowContent
): Promise< void > => {
    await expect( row ).toHaveClass(
        new RegExp( `bcew-blocks-cards--count-${ content.count }` )
    );
    await expect( row.locator( CARD_CLASS ) ).toHaveCount( content.count );
    await expect( row.locator( nestedBlockClass ) ).toHaveCount(
        content.count
    );
    await expect( row.getByText( content.heading ) ).toBeVisible();
};

test.describe( 'Cards block — full user journey', () => {
    test.beforeEach( async ( { admin, editor } ) => {
        await admin.createNewPost();
        await editor.openDocumentSettingsSidebar();
    } );

    test.afterAll(
        async ( { requestUtils } ) => await requestUtils.deleteAllPosts()
    );

    test( 'builds icon-text and image-text card rows and renders them on the frontend', async ( {
        editor,
        page,
    } ) => {
        // This journey touches a lot of editor surface; give it extra time.
        test.slow();

        // --- Phase 1: Icon + Text row -------------------------------------
        await editor.insertBlock( { name: CARDS_BLOCK } );

        const iconCards = getCardsBlock( editor, 0 );
        await expect( iconCards ).toBeVisible();
        // Defaults to two Icon + Text cards.
        await expect( iconCards ).toHaveClass(
            /bcew-blocks-cards--type-icon-text/
        );
        await expect( getNestedBlocks( iconCards, CARD_BLOCK ) ).toHaveCount(
            2
        );

        // Grow the row to three cards via the count slider.
        await setCardCount( editor, iconCards, ICON_ROW.count );
        await expect( getNestedBlocks( iconCards, CARD_BLOCK ) ).toHaveCount(
            ICON_ROW.count
        );
        await expect(
            getNestedBlocks( iconCards, ICON_TEXT_BLOCK )
        ).toHaveCount( ICON_ROW.count );

        await fillFirstCardContent( iconCards, ICON_ROW );

        // --- Phase 2: Image + Text row ------------------------------------
        await editor.insertBlock( { name: CARDS_BLOCK } );

        const mediaCards = getCardsBlock( editor, 1 );
        await expect( mediaCards ).toBeVisible();

        // Switch the second row to Image + Text via the dropdown.
        await setContentType( editor, mediaCards, 'media-text' );
        await expect( mediaCards ).toHaveClass(
            /bcew-blocks-cards--type-media-text/
        );
        await expect(
            getNestedBlocks( mediaCards, MEDIA_TEXT_BLOCK )
        ).toHaveCount( 2 );
        await expect(
            getNestedBlocks( mediaCards, ICON_TEXT_BLOCK )
        ).toHaveCount( 0 );

        // Confirm two cards via the count control (matches the default).
        await setCardCount( editor, mediaCards, MEDIA_ROW.count );
        await expect(
            getNestedBlocks( mediaCards, MEDIA_TEXT_BLOCK )
        ).toHaveCount( MEDIA_ROW.count );

        await fillFirstCardContent( mediaCards, MEDIA_ROW );

        // --- Phase 3: Publish and verify the frontend ---------------------
        const postId = await editor.publishPost();
        expect( postId ).not.toBeNull();

        await page.goto( `/?p=${ postId as number }` );

        const rows = page.locator( CARDS_CLASS );
        await expect( rows ).toHaveCount( 2 );

        const frontIconRow = page
            .locator( '.bcew-blocks-cards--type-icon-text' )
            .first();
        await assertFrontendRow( frontIconRow, ICON_TEXT_CLASS, ICON_ROW );

        const frontMediaRow = page
            .locator( '.bcew-blocks-cards--type-media-text' )
            .first();
        await assertFrontendRow( frontMediaRow, MEDIA_TEXT_CLASS, MEDIA_ROW );
    } );
} );
