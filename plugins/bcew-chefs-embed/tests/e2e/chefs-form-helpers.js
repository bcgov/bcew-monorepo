const { expect } = require( '@wordpress/e2e-test-utils-playwright' );

const BLOCK_NAME = 'bcew-chefs-embed/chefs-form';
const CHEFS_BASE_URL = 'https://submit.digital.gov.bc.ca/app';

const getChefsFormViewerStub = ( loadError ) => `
	class ChefsFormViewerStub extends HTMLElement {
		connectedCallback() {
			this.style.display = 'block';
			this.style.minHeight = '40px';
		}
		load() {
			return Promise.resolve().then( () => {
				if ( ${ loadError ? JSON.stringify( loadError ) : 'null' } ) {
					this.dispatchEvent( new CustomEvent( 'formio:error', {
						bubbles: true,
						composed: true,
						detail: ${ loadError ? JSON.stringify( loadError ) : 'null' },
					} ) );
				}
			} );
		}
	}
	if ( ! customElements.get( 'chefs-form-viewer' ) ) {
		customElements.define( 'chefs-form-viewer', ChefsFormViewerStub );
	}
`;

const ensureElementExpanded = async ( element ) => {
    if ( 'false' === ( await element.getAttribute( 'aria-expanded' ) ) ) {
        await element.click();
    }
};

const stubChefsFormViewer = async ( page, { loadError } = {} ) => {
    await page.addInitScript( getChefsFormViewerStub( loadError ) );
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

const selectFormAndPublish = async (
    admin,
    editor,
    page,
    formId,
    confirmationMessage = ''
) => {
    await admin.createNewPost();
    await editor.insertBlock( { name: BLOCK_NAME } );
    await ensureBlockSettingsVisible( editor, page );
    await page.getByLabel( 'Form ID or share URL' ).first().fill( formId );
    if ( confirmationMessage ) {
        await page
            .getByLabel( 'Confirmation message' )
            .first()
            .fill( confirmationMessage );
    }
    const postId = await editor.publishPost();
    expect( postId ).not.toBeNull();
    return postId;
};

const publishFormAndVisit = async (
    { admin, editor, page },
    { formId, confirmation, loadError }
) => {
    await stubChefsFormViewer( page, { loadError } );
    const postId = await selectFormAndPublish(
        admin,
        editor,
        page,
        formId,
        confirmation
    );
    await page.context().clearCookies();
    const response = await page.goto( `/?p=${ postId }` );
    expect( response ).not.toBeNull();
    return response;
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

const getFormViewer = async ( page ) => page.locator( 'chefs-form-viewer' );

const getFormBlock = async ( page ) => {
    return page.locator( '.bcew-chefs-form' ).first();
};

const getFormSuccess = async ( page ) => {
    return page.locator( '.bcew-chefs-form__success' );
};

const getFormError = async ( page ) => {
    return page.locator( '.bcew-chefs-form > .bcew-chefs-form__error' );
};

const dispatchFormioEvent = async ( viewer, eventName, detail ) => {
    await viewer.evaluate(
        ( element, payload ) => {
            element.dispatchEvent(
                new CustomEvent( payload.eventName, {
                    bubbles: true,
                    composed: true,
                    detail: payload.detail,
                } )
            );
        },
        { eventName, detail }
    );
};

module.exports = {
    CHEFS_BASE_URL,
    BLOCK_NAME,
    assertBlockVisible,
    dispatchFormioEvent,
    ensureBlockSettingsVisible,
    ensureElementExpanded,
    getChefsBlock,
    getFormBlock,
    getFormError,
    getFormSuccess,
    getFormViewer,
    publishFormAndVisit,
    selectFormAndPublish,
    stubChefsFormViewer,
};
