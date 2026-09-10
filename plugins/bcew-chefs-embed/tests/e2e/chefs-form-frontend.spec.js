const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const {
    addSavedForm,
    acquireStatefulTestLock,
    publishFormAndVisit,
    releaseStatefulTestLock,
    selectFormAndPublish,
    setup,
} = require( './chefs-form-helpers' );

test.describe( 'CHEFS Form frontend', () => {
    test.beforeAll( acquireStatefulTestLock );
    test.afterAll( releaseStatefulTestLock );
    test.beforeEach( setup );

    test( 'published page markup includes Form ID only and loads the CHEFS viewer', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = '77777777-7777-4777-8777-777777777777';
        const mockBaseUrl = 'https://chefs-frontend.test/app';
        const mockToken = 'frontend-token-secret';
        const response = await publishFormAndVisit( admin, editor, page, {
            formId,
            apiKey: 'frontend-test-api-key',
            token: mockToken,
            baseUrl: mockBaseUrl,
        } );
        const serverHtml = await response.text();
        expect( serverHtml ).toContain( `data-form-id="${ formId }"` );
        expect( serverHtml ).not.toContain( 'frontend-test-api-key' );
        expect( serverHtml ).not.toContain( mockToken );
        expect( serverHtml ).not.toContain( 'auth-token' );
        expect( serverHtml ).not.toContain( 'api-key' );
        const block = page.locator( '.bcew-chefs-form' ).first();
        await expect( block ).toHaveAttribute( 'data-form-id', formId );
        const viewer = page.locator( 'chefs-form-viewer' );
        await expect( viewer ).toBeAttached();
        await expect( viewer ).toHaveAttribute( 'form-id', formId );
        await expect( viewer ).toHaveAttribute( 'auth-token', mockToken );
        await expect( viewer ).toHaveAttribute( 'base-url', mockBaseUrl );
        await expect( viewer ).not.toHaveAttribute( 'read-only' );
        await expect( viewer ).toHaveAttribute(
            'auto-reload-on-submit',
            'false'
        );
    } );

    test( 'published page shows generic success message after submit', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
        await publishFormAndVisit( admin, editor, page, {
            formId,
            apiKey: 'frontend-success-api-key',
            token: 'frontend-success-token',
            baseUrl: 'https://chefs-frontend.test/app',
        } );
        const viewer = page.locator( 'chefs-form-viewer' );
        await expect( viewer ).toBeAttached();
        await expect( viewer ).toHaveAttribute(
            'auto-reload-on-submit',
            'false'
        );
        await viewer.evaluate( ( element ) => {
            element.dispatchEvent(
                new CustomEvent( 'formio:submitDone', {
                    bubbles: true,
                    composed: true,
                    detail: { submission: {} },
                } )
            );
        } );
        const success = page.locator( '.bcew-chefs-form__success' );
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
        await publishFormAndVisit( admin, editor, page, {
            formId: 'cccccccc-dddd-4eee-8fff-111111111111',
            apiKey: 'frontend-error-handler-key',
            token: 'frontend-error-handler-token',
            baseUrl: 'https://chefs-frontend.test/app',
        } );
        const viewer = page.locator( 'chefs-form-viewer' );
        await expect( viewer ).toBeAttached();
        await viewer.evaluate( ( element ) => {
            element.dispatchEvent(
                new CustomEvent( 'formio:error', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        title: 'Bad Request',
                        status: 400,
                        detail: 'Request is missing content or is malformed',
                    },
                } )
            );
        } );
        const error = page.locator(
            '.bcew-chefs-form > .bcew-chefs-form__error'
        );
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
        await viewer.evaluate( ( element ) => {
            element.dispatchEvent(
                new CustomEvent( 'formio:error', {
                    bubbles: true,
                    composed: true,
                    detail: { error: 'Submission failed' },
                } )
            );
        } );
        await expect( error.getByRole( 'heading', { level: 2 } ) ).toHaveCount(
            0
        );
        await expect( error.getByText( 'Submission failed' ) ).toBeVisible();
        await expect( viewer ).toBeAttached();
        await expect(
            page.locator( '.bcew-chefs-form > .bcew-chefs-form__error' )
        ).toHaveCount( 1 );
    } );

    test( 'published page shows custom success message after submit', async ( {
        admin,
        editor,
        page,
    } ) => {
        const customMessage = 'Thanks for applying to this program.';
        await publishFormAndVisit( admin, editor, page, {
            formId: 'cccccccc-dddd-4eee-8fff-000000000000',
            apiKey: 'frontend-custom-api-key',
            token: 'frontend-custom-success-token',
            baseUrl: 'https://chefs-frontend.test/app',
            confirmation: customMessage,
        } );
        const viewer = page.locator( 'chefs-form-viewer' );
        await expect( viewer ).toBeAttached();
        await viewer.evaluate( ( element ) => {
            element.dispatchEvent(
                new CustomEvent( 'formio:submitDone', {
                    bubbles: true,
                    composed: true,
                    detail: { submission: {} },
                } )
            );
        } );
        const success = page.locator( '.bcew-chefs-form__success' );
        await expect( success ).toBeVisible();
        await expect( success.getByText( customMessage ) ).toBeVisible();
        await expect(
            success.getByText( 'Your form has been submitted successfully' )
        ).toHaveCount( 0 );
        await expect( page.locator( 'chefs-form-viewer' ) ).toHaveCount( 0 );
    } );

    test( 'published page shows an error when embed-config fails', async ( {
        admin,
        editor,
        page,
    } ) => {
        const formId = '88888888-8888-4888-8888-888888888888';
        await addSavedForm( admin, page, formId, 'frontend-error-api-key' );
        await page.route(
            /bcew-chefs-embed(\/|%2F)v1(\/|%2F)embed-config/,
            async ( route ) => {
                await route.fulfill( {
                    status: 404,
                    contentType: 'application/json',
                    body: JSON.stringify( {
                        code: 'chefs_form_not_configured',
                        message: 'Unable to load the CHEFS form configuration.',
                    } ),
                } );
            }
        );
        const postId = await selectFormAndPublish(
            admin,
            editor,
            page,
            formId
        );
        await page.context().clearCookies();
        await page.goto( `/?p=${ postId }` );
        await expect(
            page.getByRole( 'alert' ).filter( {
                hasText: 'Unable to load the CHEFS form configuration.',
            } )
        ).toBeVisible();
    } );
} );
