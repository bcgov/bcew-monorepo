const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const {
    BLOCK_NAME,
    assertBlockVisible,
    ensureBlockSettingsVisible,
    getChefsBlock,
    stubChefsFormViewer,
} = require( './chefs-form-helpers' );

const FORM_ID = '11111111-1111-4111-8111-111111111111';

test.describe( 'CHEFS Form editor', () => {
    test( 'accepts a CHEFS share URL and previews the selected form without a token', async ( {
        admin,
        editor,
        page,
    } ) => {
        await stubChefsFormViewer( page );
        await admin.createNewPost();
        await expect( page ).toHaveURL( /\/wp-admin\/post-new\.php/ );
        await expect(
            page.locator( '.block-editor__container' )
        ).toBeVisible();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await assertBlockVisible( editor );
        await ensureBlockSettingsVisible( editor, page );

        const formInput = page.getByLabel( 'Form ID or share URL' ).first();
        const shareUrl = `https://submit.digital.gov.bc.ca/app/form/submit?f=${ FORM_ID }`;
        await formInput.fill( shareUrl );
        await expect
            .poll(
                async () => ( await getChefsBlock( editor ) ).attributes.formId
            )
            .toBe( FORM_ID );

        const viewer = editor.canvas.locator( 'chefs-form-viewer' );
        await expect( viewer ).toBeAttached();
        await expect( viewer ).toHaveAttribute( 'form-id', FORM_ID );
        await expect( viewer ).not.toHaveAttribute( 'auth-token' );
        await expect( viewer ).toHaveAttribute( 'base-url' );
        await expect( viewer ).toHaveAttribute( 'read-only', '' );
    } );

    test( 'stores only a normalized Form ID and plain-text confirmation', async ( {
        admin,
        editor,
        page,
    } ) => {
        await stubChefsFormViewer( page );
        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );

        const formInput = page.getByLabel( 'Form ID or share URL' ).first();
        await formInput.fill( FORM_ID.toUpperCase() );
        const confirmation = 'Thanks for applying.\nWe will be in touch.';
        await page
            .getByLabel( 'Confirmation message' )
            .first()
            .fill( confirmation );

        await expect
            .poll( async () => ( await getChefsBlock( editor ) ).attributes )
            .toMatchObject( {
                formId: FORM_ID,
                confirmationMessage: confirmation,
            } );
        await expect(
            page.getByText( 'Enter a valid CHEFS Form ID or share URL.' )
        ).toHaveCount( 0 );
    } );

    test( 'rejects invalid Form ID input without persisting it', async ( {
        admin,
        editor,
        page,
    } ) => {
        await admin.createNewPost();
        await editor.insertBlock( { name: BLOCK_NAME } );
        await ensureBlockSettingsVisible( editor, page );

        await page
            .getByLabel( 'Form ID or share URL' )
            .first()
            .fill( 'not-a-chefs-form' );

        await expect(
            page
                .locator( '.components-notice' )
                .getByText( 'Enter a valid CHEFS Form ID or share URL.' )
        ).toBeVisible();
        expect( ( await getChefsBlock( editor ) ).attributes.formId ).toBe(
            ''
        );
    } );

    test( 'shows the placeholder and documentation link when no form is selected', async ( {
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
        await expect(
            editor.canvas.getByText(
                'Select a CHEFS form in the block settings.'
            )
        ).toBeVisible();
        await ensureBlockSettingsVisible( editor, page );
        await expect( page.getByLabel( 'Form ID or share URL' ) ).toBeVisible();
        await expect(
            page.getByRole( 'link', { name: 'View CHEFS documentation' } )
        ).toHaveAttribute(
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
        await stubChefsFormViewer( page );
        const post = await requestUtils.createPost( {
            title: 'Legacy CHEFS block',
            status: 'draft',
            content: `<!-- wp:${ BLOCK_NAME } {"formId":"${ FORM_ID }"} /-->`,
        } );

        await admin.editPost( post.id );
        await assertBlockVisible( editor );
        await expect( page.locator( '.block-editor-warning' ) ).toHaveCount(
            0
        );

        const content = await page.evaluate( () =>
            window.wp.blocks.serialize(
                window.wp.data.select( 'core/block-editor' ).getBlocks()
            )
        );
        expect( content ).toContain( `data-form-id="${ FORM_ID }"` );
        expect( content ).toContain( 'bcew-chefs-form__mount' );
    } );
} );
