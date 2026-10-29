const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const {
    dispatchFormioEvent,
    getFormBlock,
    getFormError,
    getFormSuccess,
    getFormViewer,
    publishFormAndVisit,
} = require( './chefs-form-helpers' );

test.describe( 'CHEFS Form frontend', () => {
    test( 'renders a Public form without an API key or token and shows generic success after submit', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = '77777777-7777-4777-8777-777777777777';
        const response = await publishFormAndVisit(
            { admin, editor, page },
            { formId }
        );
        const serverHtml = await response.text();
        expect( serverHtml ).toContain( `data-form-id="${ formId }"` );
        expect( serverHtml ).not.toContain( 'auth-token' );
        expect( serverHtml ).not.toContain( 'api-key' );

        const block = await getFormBlock( page );
        await expect( block ).toHaveAttribute( 'data-form-id', formId );
        const viewer = await getFormViewer( page );
        await expect( viewer ).toBeAttached();
        await expect( viewer ).toHaveAttribute( 'form-id', formId );
        await expect( viewer ).not.toHaveAttribute( 'auth-token' );
        await expect( viewer ).toHaveAttribute(
            'auto-reload-on-submit',
            'false'
        );
        await dispatchFormioEvent( viewer, 'formio:submitDone', {
            submission: {},
        } );
        const success = await getFormSuccess( page );
        await expect( success ).toBeVisible();
        await expect( success ).toHaveAttribute( 'role', 'status' );
        await expect( success.getByRole( 'heading', { level: 2 } ) ).toHaveText(
            'Success'
        );
        await expect(
            success.getByText( 'Your form has been submitted successfully' )
        ).toBeVisible();
        await expect( page.locator( 'chefs-form-viewer' ) ).toHaveCount( 0 );
    } );

    test( 'published page shows CHEFS error above the form', async ( {
        admin,
        editor,
        page,
    } ) => {
        await publishFormAndVisit(
            { admin, editor, page },
            {
                formId: 'cccccccc-dddd-4eee-8fff-111111111111',
                loadError: {
                    error: {
                        title: 'Bad Request',
                        status: 400,
                        detail: 'Request is missing content or is malformed',
                    },
                },
            }
        );
        const viewer = await getFormViewer( page );
        const error = await getFormError( page );
        await expect( error ).toBeVisible();
        await expect( error ).toHaveAttribute( 'role', 'alert' );
        await expect( error.getByRole( 'heading', { level: 2 } ) ).toHaveText(
            'Bad Request - 400'
        );
        await expect(
            error.getByText( 'Request is missing content or is malformed' )
        ).toBeVisible();
        await expect( viewer ).toBeAttached();
        const errorIsAboveForm = await page.evaluate( () => {
            const banner = document.querySelector(
                '.bcew-chefs-form > .bcew-chefs-form__error'
            );
            const mount = document.querySelector( '.bcew-chefs-form__mount' );
            return banner && mount && banner.nextElementSibling === mount;
        } );
        expect( errorIsAboveForm ).toBe( true );
        await dispatchFormioEvent( viewer, 'formio:error', {
            error: 'Submission failed',
        } );
        await expect( error.getByRole( 'heading', { level: 2 } ) ).toHaveCount(
            0
        );
        await expect( error.getByText( 'Submission failed' ) ).toBeVisible();
        await expect( viewer ).toBeAttached();
        await expect( error ).toHaveCount( 1 );
    } );

    test( 'published page shows the configured plain-text confirmation after submit', async ( {
        admin,
        editor,
        page,
    } ) => {
        const confirmation = 'Thanks for applying to this program.';
        await publishFormAndVisit(
            { admin, editor, page },
            {
                formId: 'cccccccc-dddd-4eee-8fff-000000000000',
                confirmation,
            }
        );
        const viewer = page.locator( 'chefs-form-viewer' );
        await expect( viewer ).toBeAttached();
        await dispatchFormioEvent( viewer, 'formio:submitDone', {
            submission: {},
        } );
        const success = await getFormSuccess( page );
        await expect( success ).toBeVisible();
        await expect( success.getByText( confirmation ) ).toBeVisible();
        await expect(
            success.getByText( 'Your form has been submitted successfully' )
        ).toHaveCount( 0 );
        await expect( page.locator( 'chefs-form-viewer' ) ).toHaveCount( 0 );
    } );
} );
