const { expect } = require( '@wordpress/e2e-test-utils-playwright' );

const BLOCK_NAME = 'bcew-chefs-embed/chefs-form';

const ensureElementExpanded = async ( element ) => {
    if ( 'false' === ( await element.getAttribute( 'aria-expanded' ) ) ) {
        await element.click();
    }
};

const ensureBlockSettingsVisible = async ( editor, page ) => {
    const block = editor.canvas
        .locator( `[data-type="${ BLOCK_NAME }"]` )
        .first();
    await expect( block ).toBeVisible();
    await block.click();
    const settingsButton = page
        .getByRole( 'button', { name: 'Settings' } )
        .first();
    await ensureElementExpanded( settingsButton );
    const chefsPanelButton = page
        .getByRole( 'button', { name: 'CHEFS Form' } )
        .first();
    if ( ( await chefsPanelButton.count() ) > 0 ) {
        await ensureElementExpanded( chefsPanelButton );
    }
    const chefsPanel = page
        .locator( '.components-panel__body' )
        .filter( { hasText: 'CHEFS Form' } )
        .first();
    await expect( chefsPanel ).toBeVisible();
    await expect( chefsPanel.locator( '.components-spinner' ) ).toHaveCount(
        0
    );
};

const assertBlockVisible = async ( editor ) => {
    const block = editor.canvas
        .locator( `[data-type="${ BLOCK_NAME }"]` )
        .first();
    await expect( block ).toBeVisible();
    return block;
};

const getChefsBlock = async ( editor ) => {
    const blocks = await editor.getBlocks();
    return blocks.find( ( block ) => block.name === BLOCK_NAME );
};

module.exports = {
    BLOCK_NAME,
    assertBlockVisible,
    ensureBlockSettingsVisible,
    getChefsBlock,
};
