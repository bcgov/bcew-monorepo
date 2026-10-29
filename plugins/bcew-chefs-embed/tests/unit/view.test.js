jest.mock( '../../src/chefs-form/utils/ensure-chefs-form-viewer', () =>
    jest.fn( () => Promise.resolve() )
);

const FORM_ID = '43cfb894-a0cf-4bef-8026-7c8001e3cdf5';

const loadView = () => {
    jest.isolateModules( () => {
        require( '../../src/chefs-form/view' );
    } );
};

describe( 'CHEFS Form view script', () => {
    afterEach( () => {
        document.body.innerHTML = '';
    } );

    it( 'creates a tokenless viewer from saved block markup', () => {
        document.body.innerHTML = `
            <div class="wp-block-bcew-chefs-embed-chefs-form bcew-chefs-form" data-form-id="${ FORM_ID }">
                <div class="bcew-chefs-form__mount" aria-live="polite"></div>
            </div>`;

        loadView();

        const viewer = document.querySelector( 'chefs-form-viewer' );
        expect( viewer ).not.toBeNull();
        expect( viewer.getAttribute( 'form-id' ) ).toBe( FORM_ID );
        expect( viewer.getAttribute( 'base-url' ) ).toBe(
            'https://submit.digital.gov.bc.ca/app'
        );
        expect( viewer.getAttribute( 'auto-reload-on-submit' ) ).toBe(
            'false'
        );
        expect( viewer.hasAttribute( 'auth-token' ) ).toBe( false );
    } );

    it( 'keeps a server-rendered viewer instead of creating another', () => {
        document.body.innerHTML = `
            <div class="bcew-chefs-form" data-form-id="${ FORM_ID }">
                <div class="bcew-chefs-form__mount">
                    <chefs-form-viewer form-id="${ FORM_ID }" auth-token="token" base-url="https://example.test/app"></chefs-form-viewer>
                </div>
            </div>`;

        loadView();

        const viewers = document.querySelectorAll( 'chefs-form-viewer' );
        expect( viewers ).toHaveLength( 1 );
        expect( viewers[ 0 ].getAttribute( 'auth-token' ) ).toBe( 'token' );
    } );

    it( 'does not create a viewer without a Form ID', () => {
        document.body.innerHTML = `
            <div class="bcew-chefs-form">
                <div class="bcew-chefs-form__mount"></div>
            </div>`;

        loadView();

        expect( document.querySelector( 'chefs-form-viewer' ) ).toBeNull();
    } );
} );
