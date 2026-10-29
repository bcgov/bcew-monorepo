const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const {
    BLOCK_NAME,
    addSavedForm,
    assertBlockVisible,
    clearSavedForms,
    ensureBlockSettingsVisible,
    getChefsBlock,
    getFormOptionLabels,
    getFormOptionValues,
    getFormSelect,
    mockChefsFormRoutes,
    CHEFS_BASE_URL,
    E2E_TOKEN,
    selectFormAndPublish,
    selectSavedFormId,
} = require( './chefs-form-helpers' );

test.describe( 'CHEFS Form editor', () => {
    test.beforeEach( async ( { requestUtils } ) => {
        await clearSavedForms( requestUtils );
    } );

    test.afterEach( async ( { page } ) => {
        await page.unrouteAll( { behavior: 'wait' } );
    } );

    test( 'can be inserted from the block editor with a formId attribute', async ( {
        admin,
        editor,
        page,
    } ) => {
        await admin.createNewPost();
        await expect( page ).toHaveURL( /\/wp-admin\/post-new\.php/ );
        await expect(
            page.locator( '.block-editor__container' )
        ).toBeVisible();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await assertBlockVisible( editor );
        const chefsBlock = await getChefsBlock( editor );
        expect( chefsBlock ).toBeDefined();
        expect( chefsBlock.attributes.formId ).toBeDefined();
    } );

    test( 'loads saved Form IDs into the sidebar dropdown and preview', async ( {
        admin,
        editor,
        page,
        requestUtils,
    } ) => {
        const formIdOne = '11111111-1111-4111-8111-111111111111';
        const formIdTwo = '22222222-2222-4222-8222-222222222222';
        await addSavedForm( requestUtils, formIdOne, 'api-key-one' );
        await addSavedForm( requestUtils, formIdTwo, 'api-key-two' );
        await mockChefsFormRoutes( page );
        await admin.createNewPost();
        await expect( page ).toHaveURL( /\/wp-admin\/post-new\.php/ );
        await expect(
            page.locator( '.block-editor__container' )
        ).toBeVisible();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );
        const formSelect = getFormSelect( page );
        await expect( formSelect ).toBeVisible();
        const optionValues = await getFormOptionValues( page );
        expect( optionValues ).toEqual(
            expect.arrayContaining( [ '', formIdOne, formIdTwo ] )
        );
        // Verify form titles are displayed in dropdown options
        const optionLabels = await getFormOptionLabels( page );
        expect( optionLabels ).toEqual(
            expect.arrayContaining( [ 'E2E test form' ] )
        );
        await selectSavedFormId( page, formIdOne );
        const viewer = editor.canvas.locator( 'chefs-form-viewer' );
        await expect( viewer ).toBeAttached();
        await expect( viewer ).toHaveAttribute( 'form-id', formIdOne );
        await expect( viewer ).toHaveAttribute( 'auth-token', E2E_TOKEN );
        await expect( viewer ).toHaveAttribute( 'base-url', CHEFS_BASE_URL );
        await expect( viewer ).toHaveAttribute( 'read-only', '' );
        await expect( viewer ).toHaveAttribute(
            'data-formio-js',
            `${ CHEFS_BASE_URL }/webcomponents/v1/assets/formio.js`
        );
    } );

    test( 'persists and clears a selected Form ID when the saved form is removed', async ( {
        admin,
        editor,
        page,
        requestUtils,
    } ) => {
        const formId = '33333333-3333-4333-8333-333333333333';
        await addSavedForm( requestUtils, formId, 'persisted-api-key' );
        await mockChefsFormRoutes( page );
        const postId = await selectFormAndPublish(
            admin,
            editor,
            page,
            formId
        );
        await page.goto( `/wp-admin/post.php?post=${ postId }&action=edit` );
        await assertBlockVisible( editor );
        await ensureBlockSettingsVisible( editor, page );
        await expect( page.getByLabel( 'Form name' ).first() ).toHaveValue(
            formId
        );
        await clearSavedForms( requestUtils );
        await page.goto( `/wp-admin/post.php?post=${ postId }&action=edit` );
        await assertBlockVisible( editor );
        await expect(
            editor.canvas.getByText(
                'Select a CHEFS form in the block settings.'
            )
        ).toBeVisible();
        const chefsBlock = await getChefsBlock( editor );
        expect( chefsBlock.attributes.formId ).toBe( '' );
    } );

    test( 'shows empty-state documentation link and placeholder when no form is selected', async ( {
        admin,
        editor,
        page,
        requestUtils,
    } ) => {
        await clearSavedForms( requestUtils );
        await admin.createNewPost();
        await expect( page ).toHaveURL( /\/wp-admin\/post-new\.php/ );
        await expect(
            page.locator( '.block-editor__container' )
        ).toBeVisible();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await expect(
            editor.canvas.getByText(
                'Select a CHEFS form in the block settings.'
            )
        ).toBeVisible();
        await ensureBlockSettingsVisible( editor, page );
        const chefsPanel = page
            .locator( '.components-panel__body' )
            .filter( { hasText: 'CHEFS Form' } )
            .first();
        await expect(
            chefsPanel.getByText( /No CHEFS forms have been saved yet\./i )
        ).toBeVisible();
        const documentationLink = chefsPanel.getByRole( 'link', {
            name: /View CHEFS documentation/,
        } );
        await expect( documentationLink ).toBeVisible();
        await expect( documentationLink ).toHaveAttribute(
            'href',
            'https://bcgov.github.io/bcew-monorepo/docs/content/plugins/bcew-chefs-embed/'
        );
    } );

    test( 'upgrades legacy server-rendered blocks to saved markup without invalid-block warnings', async ( {
        admin,
        editor,
        page,
        requestUtils,
    } ) => {
        const formId = '44444444-4444-4444-8444-444444444444';
        await addSavedForm( requestUtils, formId, 'legacy-api-key' );
        await mockChefsFormRoutes( page );
        const post = await requestUtils.createPost( {
            title: 'Legacy CHEFS block',
            status: 'draft',
            content: `<!-- wp:${ BLOCK_NAME } {"formId":"${ formId }"} /-->`,
        } );

        await admin.editPost( post.id );
        await assertBlockVisible( editor );
        await expect( page.locator( '.block-editor-warning' ) ).toHaveCount(
            0
        );

        // Serialize current blocks; unedited posts return their stored raw content.
        const content = await page.evaluate( () =>
            window.wp.blocks.serialize(
                window.wp.data.select( 'core/block-editor' ).getBlocks()
            )
        );
        expect( content ).toContain( `data-form-id="${ formId }"` );
        expect( content ).toContain( 'bcew-chefs-form__mount' );
    } );
} );
