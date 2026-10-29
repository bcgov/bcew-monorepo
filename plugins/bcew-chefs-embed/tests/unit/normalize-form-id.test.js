import normalizeFormId from '../../src/chefs-form/utils/normalize-form-id';

const FORM_ID = '43cfb894-a0cf-4bef-8026-7c8001e3cdf5';

describe( 'normalizeFormId', () => {
    it( 'returns a Form ID unchanged', () => {
        expect( normalizeFormId( FORM_ID ) ).toBe( FORM_ID );
    } );

    it( 'trims whitespace and lowercases a Form ID', () => {
        expect( normalizeFormId( `  ${ FORM_ID.toUpperCase() }\n` ) ).toBe(
            FORM_ID
        );
    } );

    it.each( [
        `https://submit.digital.gov.bc.ca/app/form/submit?f=${ FORM_ID }`,
        `https://submit.digital.gov.bc.ca/app/form/manage?f=${ FORM_ID }&fd=formDesigner`,
        `https://submit.digital.gov.bc.ca/app/form/submit?f=${ FORM_ID }#top`,
        `https://chefs-dev.apps.silver.devops.gov.bc.ca/pr-1966/form/submit?f=${ FORM_ID }`,
    ] )( 'extracts the Form ID from share URL %s', ( url ) => {
        expect( normalizeFormId( url ) ).toBe( FORM_ID );
    } );

    it.each( [
        [ 'an empty string', '' ],
        [ 'a non-string value', undefined ],
        [ 'arbitrary text', 'my form' ],
        [ 'a malformed Form ID', '43cfb894-a0cf-4bef-8026' ],
        [
            'a URL without an f parameter',
            'https://submit.digital.gov.bc.ca/app/form/manage',
        ],
        [
            'a URL with an invalid f parameter',
            'https://submit.digital.gov.bc.ca/app/form/submit?f=not-a-form',
        ],
        [ 'a non-HTTP URL', `javascript:alert(1)?f=${ FORM_ID }` ],
    ] )( 'returns an empty string for %s', ( _label, value ) => {
        expect( normalizeFormId( value ) ).toBe( '' );
    } );
} );
