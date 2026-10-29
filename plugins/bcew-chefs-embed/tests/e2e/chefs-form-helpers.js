const { expect } = require( '@wordpress/e2e-test-utils-playwright' );

const BLOCK_NAME = 'bcew-chefs-embed/chefs-form';
const SEED_FORMS_PATH = '/bcew-chefs-embed-e2e/v1/forms';

const getChefsFormViewerStub = ( loadError ) => `
	class ChefsFormViewerStub extends HTMLElement {
		connectedCallback() {
			this.style.display = 'block';
			this.style.minHeight = '40px';
		}
		load() {
            this.setAttribute( 'data-formio-js', this.endpoints?.formioJs || '' );
            return Promise.resolve().then( () => {
                if ( ${ loadError ? JSON.stringify( loadError ) : 'null' } ) {
                    this.dispatchEvent( new CustomEvent( 'formio:error', {
                        bubbles: true,
                        composed: true,
                        detail: ${
                            loadError ? JSON.stringify( loadError ) : 'null'
                        },
                    } ) );
                }
                return undefined;
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

// Seed forms through the test-only REST route registered by e2e-chefs-mock-loader.php.
const clearSavedForms = async ( requestUtils ) => {
    await requestUtils.rest( { path: SEED_FORMS_PATH, method: 'DELETE' } );
};

const addSavedForm = async ( requestUtils, formId, apiKey, confirmation ) => {
    const result = await requestUtils.rest( {
        path: SEED_FORMS_PATH,
        method: 'POST',
        data: {
            form_id: formId,
            api_key: apiKey,
            confirmation: confirmation || '',
        },
    } );
    expect( result.success ).toBe( true );
};

const selectSavedFormId = async ( page, formId ) => {
    const formSelect = page.getByLabel( 'Form name' ).first();
    await expect( formSelect ).toBeVisible();
    await expect(
        formSelect.locator( `option[value="${ formId }"]` )
    ).toBeAttached();
    await formSelect.selectOption( formId );
    await expect( formSelect ).toHaveValue( formId );
};

const CHEFS_BASE_URL = 'https://submit.digital.gov.bc.ca/app';
const E2E_TOKEN = 'e2e-test-token';

// The token comes from the server-side E2eChefsMock; only the viewer script is stubbed.
const mockChefsFormRoutes = async ( page, { loadError } = {} ) => {
    await page.route(
        `${ CHEFS_BASE_URL }/embed/chefs-form-viewer.min.js`,
        async ( route ) => {
            await route.fulfill( {
                status: 200,
                contentType: 'application/javascript',
                body: getChefsFormViewerStub( loadError ),
            } );
        }
    );
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

const selectFormAndPublish = async ( admin, editor, page, formId ) => {
    await admin.createNewPost();
    await editor.insertBlock( { name: BLOCK_NAME } );
    await ensureBlockSettingsVisible( editor, page );
    await selectSavedFormId( page, formId );
    const postId = await editor.publishPost();
    expect( postId ).not.toBeNull();
    return postId;
};

const publishFormAndVisit = async (
    { admin, editor, page, requestUtils },
    { formId, apiKey, confirmation, loadError }
) => {
    await addSavedForm( requestUtils, formId, apiKey, confirmation );
    await mockChefsFormRoutes( page, { loadError } );
    const postId = await selectFormAndPublish( admin, editor, page, formId );
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

const getFormSelect = ( page ) => page.getByLabel( 'Form name' ).first();

const getFormOptionValues = async ( page ) => {
    const formSelect = getFormSelect( page );
    return formSelect
        .locator( 'option' )
        .evaluateAll( ( options ) =>
            options.map( ( option ) => option.value )
        );
};

const getFormOptionLabels = async ( page ) => {
    const formSelect = getFormSelect( page );
    return formSelect
        .locator( 'option' )
        .evaluateAll( ( options ) =>
            options.map( ( option ) => option.textContent )
        );
};

const getFormViewer = async ( page ) => {
    return page.locator( 'chefs-form-viewer' );
};

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
    E2E_TOKEN,
    BLOCK_NAME,
    addSavedForm,
    assertBlockVisible,
    clearSavedForms,
    dispatchFormioEvent,
    ensureBlockSettingsVisible,
    ensureElementExpanded,
    getChefsBlock,
    getFormBlock,
    getFormError,
    getFormOptionLabels,
    getFormOptionValues,
    getFormSelect,
    getFormSuccess,
    getFormViewer,
    mockChefsFormRoutes,
    publishFormAndVisit,
    selectFormAndPublish,
    selectSavedFormId,
};
