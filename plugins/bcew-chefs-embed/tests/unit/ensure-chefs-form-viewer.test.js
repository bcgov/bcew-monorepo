import ensureChefsFormViewerDefined from '../../src/chefs-form/utils/ensure-chefs-form-viewer';
import {
    CHEFS_BASE_URL,
    CHEFS_EMBED_VERSION,
    CHEFS_VIEWER_INTEGRITY,
} from '../../src/chefs-form/utils/constants';

describe( 'ensureChefsFormViewerDefined', () => {
    it( 'loads the versioned viewer with its integrity hash', async () => {
        const loading = ensureChefsFormViewerDefined( CHEFS_BASE_URL );
        const script = document.querySelector( 'script' );

        expect( script.src ).toBe(
            `${ CHEFS_BASE_URL }/embed/${ CHEFS_EMBED_VERSION }/embed/chefs-form-viewer.min.js`
        );
        expect( script.integrity ).toBe( CHEFS_VIEWER_INTEGRITY );
        expect( script.crossOrigin ).toBe( 'anonymous' );

        customElements.define(
            'chefs-form-viewer',
            class extends HTMLElement {}
        );
        script.onload();
        await expect( loading ).resolves.toBeUndefined();
    } );
} );
