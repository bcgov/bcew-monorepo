/**
 * Shared Playwright test utilities for the BCEW monorepo.
 *
 * Common helpers for e2e tests across themes and plugins.
 */

import { expect, Locator, Page } from '@playwright/test';
import { test } from '@wordpress/e2e-test-utils-playwright';
import config from './playwright.config';

/**
 * Common page interactions.
 */
export class PageHelpers {
    page: Page;

    constructor( page: Page ) {
        this.page = page;
    }

    /**
     * Navigate to a page and wait for load.
     * @param {string} url Url to navigate to.
     */
    async goto( url: string ) {
        await this.page.goto( url );
        await this.page.waitForLoadState( 'networkidle' );
    }

    /**
     * Check if element is visible.
     * @param {any} selector Selector to select.
     * @return {boolean} Whether the element is visible.
     */
    async isVisible( selector: any ) {
        return await this.page.isVisible( selector );
    }

    /**
     * Take a screenshot with timestamp.
     * @param {string} name Screenshot file name.
     */
    async takeScreenshot( name: string ) {
        const timestamp = new Date().toISOString().replace( /[:.]/g, '-' );
        await this.page.screenshot( {
            path: `screenshots/${ name }-${ timestamp }.png`,
        } );
    }
}

/**
 * WordPress-specific helpers.
 */
export class WordPressHelpers extends PageHelpers {
    /**
     * Log in to WordPress admin.
     * @param {string} username Username to log in with.
     * @param {string} password Password to log in with.
     */
    async login( username: string = 'admin', password: string = 'password' ) {
        await this.goto( '/wp-admin' );
        await this.page.fill( '#user_login', username );
        await this.page.fill( '#user_pass', password );
        await this.page.click( '#wp-submit' );
        await expect( this.page ).toHaveURL( /\/wp-admin/ );
    }

    /**
     * Activate a theme.
     * @param {string} themeSlug Theme to activate.
     */
    async activateTheme( themeSlug: string ) {
        await this.goto( '/wp-admin/themes.php' );
        await this.page.click( `[data-slug="${ themeSlug }"] .activate` );
        await expect( this.page.locator( '.notice-success' ) ).toBeVisible();
    }
}

/**
 * Render a pattern and take a screenshot.
 * @param {any}    editor      Editor object.
 * @param {string} patternSlug Slug of the pattern to render.
 */
export const renderPattern = async ( editor: any, patternSlug: string ) => {
    await editor.page
        .getByRole( 'button', { name: 'Options', exact: true } )
        .click();
    await editor.page
        .getByRole( 'menuitemradio', { name: /Code editor/ } )
        .click();
    await editor.page
        .getByRole( 'textbox', { name: 'Type text or HTML' } )
        .fill( `<!-- wp:pattern {"slug":"${ patternSlug }"} /-->` );
    await editor.page
        .getByRole( 'button', { name: 'Exit code editor' } )
        .click();
    const preview = ( await editor.openPreviewPage() )
        .locator( '.entry-content' )
        .first();
    await expect( preview ).toHaveScreenshot();
};

const EXCLUDED_STYLEBOOK_BLOCKS = new Set( [
    'avatar',
    'column',
    'comments',
    'comment-template',
    'embed',
    'footnotes',
    'html',
    'list-item',
    'media-text',
    'nextpage',
    'pagination',
    'post-date',
    'post-template',
    'pullquote',
    'query',
    'query-total',
    'spacer',
    'rss',
    'tag-cloud',
    'video',
    'calendar',
    'latest-comments',
    'archives',
] );

const STYLEBOOK_EXAMPLE_SELECTOR =
    'div.edit-site-style-book__example, div.editor-style-book__example';

const STYLEBOOK_PREVIEW_SELECTOR =
    'div.edit-site-style-book__example-preview, div.editor-style-book__example-preview';

const screenshotStylebookBlocks = async (
    blocks: Locator
): Promise< void > => {
    const blockCount = await blocks.count();
    for ( let blockIndex = 0; blockIndex < blockCount; blockIndex++ ) {
        const block = blocks.nth( blockIndex );
        const blockName = await block.getAttribute( 'id' );

        if ( ! blockName ) {
            throw new Error( 'Style book example is missing an id attribute.' );
        }

        const formattedName = blockName.replace( 'example-core/', '' );

        if ( EXCLUDED_STYLEBOOK_BLOCKS.has( formattedName ) ) {
            continue;
        }

        await expect(
            block.locator( STYLEBOOK_PREVIEW_SELECTOR )
        ).toHaveScreenshot( `style-book-${ formattedName }.png`, {
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
            maxDiffPixels: 2,
        } );
    }
};

/**
 * Render the WordPress style book and save screenshots for each example.
 *
 * @param {any} admin Admin fixture object.
 */
export const renderStylebook = async ( admin: any ) => {
    await admin.visitAdminPage( 'site-editor.php', 'path=%2Fwp_global_styles' );

    const styleBookButton = admin.page.getByRole( 'button', {
        name: 'Style Book',
    } );
    await expect( styleBookButton ).toBeVisible();

    const styleBookCanvas = admin.page.locator(
        'iframe[name="style-book-canvas"]'
    );
    const styleBookPreview = admin.page.locator(
        'iframe[name="style-book-canvas"].is-button'
    );

    // React handlers initialize ~3 s after render; each 2 s wait acts as the retry delay.
    for ( let attempt = 0; attempt < 5; attempt++ ) {
        await styleBookButton.click();
        try {
            await styleBookCanvas.waitFor( {
                state: 'attached',
                timeout: 2000,
            } );
        } catch {
            continue;
        }
        // WP 6.7+: compact preview must be activated via keyboard — click() targets the iframe content.
        if ( ( await styleBookPreview.count() ) > 0 ) {
            await styleBookPreview.focus();
            await admin.page.keyboard.press( 'Enter' );
        }
        break;
    }

    const blocksButton = admin.page.getByRole( 'button', { name: 'Blocks' } );
    if ( ( await blocksButton.count() ) > 0 ) {
        await blocksButton.first().click();
    }

    const canvas = admin.page.frameLocator(
        'iframe[name="style-book-canvas"]'
    );
    await expect( canvas.locator( 'body' ) ).toBeVisible( { timeout: 15000 } );

    const blocks = canvas.locator( STYLEBOOK_EXAMPLE_SELECTOR );
    await expect
        .poll( async () => blocks.count(), {
            timeout: 10000,
            message:
                'Expected style book examples to render in style-book-canvas iframe.',
        } )
        .toBeGreaterThan( 0 );

    await screenshotStylebookBlocks( blocks );
};

/**
 * Creates a test suite that renders the style book for visual regression testing.
 */
export const createStylebookTests = () => {
    test.describe( 'style book', () => {
        test( 'all blocks', async ( { admin } ) => {
            await renderStylebook( admin );
        } );
    } );
};

/**
 * Creates a test suite that renders each pattern for visual regression testing.
 *
 * @param {string}   themeSlug Theme slug to use as prefix for patterns.
 * @param {string[]} patterns  Array of pattern names to test.
 */
export const createPatternTests = ( themeSlug: string, patterns: string[] ) => {
    test.describe( 'pattern', () => {
        test.beforeEach( async ( { admin } ) => {
            await admin.createNewPost();
        } );

        for ( const p of patterns ) {
            test( p, async ( { editor } ) => {
                await renderPattern( editor, `${ themeSlug }/${ p }` );
            } );
        }
    } );
};

export { config };
