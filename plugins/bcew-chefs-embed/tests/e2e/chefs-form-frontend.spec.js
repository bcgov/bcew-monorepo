const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );
const {
    dispatchFormioEvent,
    getFormError,
    getFormSuccess,
    getFormViewer,
    publishFormAndVisit,
    selectFormAndPublish,
} = require( './chefs-form-helpers' );

const VIEWER_PATH = 'embed/chefs-form-viewer.min.js';
const VIEWER_BODY = 'window.__chefsViewerLoaded = true;';
const SRI_FORM_ID = '88888888-8888-4888-8888-888888888888';

// Served bodies never match the pinned hash, so these tests cover blocked loads and retries.
const routeViewerScript = async ( page, body = VIEWER_BODY ) => {
    let requests = 0;
    await page.route( `**/embed/*/${ VIEWER_PATH }`, ( route ) => {
        if ( ! page.url().includes( '/wp-admin/' ) ) {
            requests++;
        }
        route.fulfill( {
            contentType: 'text/javascript',
            headers: { 'Access-Control-Allow-Origin': '*' },
            body,
        } );
    } );
    return () => requests;
};

const visitPublishedForm = async ( { admin, editor, page }, formId ) => {
    const postId = await selectFormAndPublish( admin, editor, page, formId );
    await page.context().clearCookies();
    await page.goto( `/?p=${ postId }` );
};

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
        expect( serverHtml ).toContain( `form-id="${ formId }"` );
        expect( serverHtml ).not.toContain( 'auth-token' );
        expect( serverHtml ).not.toContain( 'api-key' );

        const viewer = await getFormViewer( page );
        await expect( viewer ).toBeAttached();
        await expect( viewer ).toHaveAttribute( 'form-id', formId );
        await expect( viewer ).not.toHaveAttribute( 'auth-token' );
        await expect( viewer ).toHaveAttribute( 'base-url', /^https:\/\/.+/ );
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

    test( 'blocks a viewer script that does not match the pinned SRI hash', async ( {
        admin,
        editor,
        page,
    } ) => {
        await routeViewerScript(
            page,
            'window.__chefsViewerLoaded = "tampered";'
        );
        await visitPublishedForm( { admin, editor, page }, SRI_FORM_ID );

        await expect( await getFormError( page ) ).toBeVisible();
        await expect(
            page.locator( `script[src$="/${ VIEWER_PATH }"]` )
        ).toHaveCount( 0 );
        expect(
            await page.evaluate( () => window.__chefsViewerLoaded )
        ).toBeUndefined();
    } );

    test( 'retries the viewer script after an SRI failure with a fresh script tag', async ( {
        admin,
        editor,
        page,
    } ) => {
        const requests = await routeViewerScript(
            page,
            'window.__chefsViewerLoaded = "tampered";'
        );
        await visitPublishedForm( { admin, editor, page }, SRI_FORM_ID );
        await expect( await getFormError( page ) ).toBeVisible();
        await expect.poll( requests ).toBe( 1 );

        // Re-run the block's view script as a second mount would.
        await page.evaluate( () => {
            const script = document.createElement( 'script' );
            script.src = document.querySelector(
                'script[src*="chefs-form/view.js"]'
            ).src;
            document.body.appendChild( script );
        } );

        await expect.poll( requests ).toBe( 2 );
    } );

    test( 'does not create a viewer when no Form ID is set', async ( {
        admin,
        editor,
        page,
    } ) => {
        await publishFormAndVisit( { admin, editor, page }, { formId: '' } );

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
            const form = document.querySelector( 'chefs-form-viewer' );
            return banner && form && banner.nextElementSibling === form;
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
