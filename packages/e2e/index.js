/**
 * Shared Playwright test utilities for the BCEW monorepo.
 *
 * Common helpers for e2e tests across themes and plugins.
 */

import { expect, test } from '@wordpress/e2e-test-utils-playwright';
import config from './playwright.config.js';

/**
 * Common page interactions.
 */
export class PageHelpers {
    constructor( page ) {
        this.page = page;
    }

    /**
     * Navigate to a page and wait for load.
     *
     * @param {string} url Url to navigate to.
     */
    async goto( url ) {
        await this.page.goto( url );
        await this.page.waitForLoadState( 'networkidle' );
    }

    /**
     * Check if element is visible.
     *
     * @param {string} selector Selector to select.
     * @return {Promise<boolean>} Whether the element is visible.
     */
    async isVisible( selector ) {
        return this.page.isVisible( selector );
    }

    /**
     * Take a screenshot with timestamp.
     *
     * @param {string} name Screenshot file name.
     */
    async takeScreenshot( name ) {
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
     *
     * @param {string} username Username to log in with.
     * @param {string} password Password to log in with.
     */
    async login( username = 'admin', password = 'password' ) {
        await this.goto( '/wp-admin' );
        await this.page.fill( '#user_login', username );
        await this.page.fill( '#user_pass', password );
        await this.page.click( '#wp-submit' );
        await expect( this.page ).toHaveURL( /\/wp-admin/ );
    }

    /**
     * Activate a theme.
     *
     * @param {string} themeSlug Theme to activate.
     */
    async activateTheme( themeSlug ) {
        await this.goto( '/wp-admin/themes.php' );
        await this.page.click( `[data-slug="${ themeSlug }"] .activate` );
        await expect( this.page.locator( '.notice-success' ) ).toBeVisible();
    }
}

const DEFAULT_STYLEBOOK_EXCLUDED_BLOCKS = [
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
    'post-template',
    'pullquote',
    'query-total',
    'spacer',
    'rss',
    'tag-cloud',
    'video',
    'calendar',
    'latest-comments',
    'archives',
];

const ensureLoggedIn = async ( page ) => {
    if ( ! page.url().includes( 'wp-login.php' ) ) {
        return false;
    }

    const username = process.env.WP_USERNAME || 'admin';
    const password = process.env.WP_PASSWORD || 'password';

    await page.locator( '#user_login' ).fill( username );
    await page.locator( '#user_pass' ).fill( password );
    await page.getByRole( 'button', { name: 'Log In' } ).click();
    await page.waitForURL( /wp-admin/ );

    return true;
};

/**
 * Register a shared style book screenshot test suite.
 *
 * @param {Object}   [options]                Test registration options.
 * @param {string[]} [options.excludedBlocks] Blocks to exclude from screenshots.
 */
export const createStylebookScreenshotTests = ( {
    excludedBlocks = DEFAULT_STYLEBOOK_EXCLUDED_BLOCKS,
} = {} ) => {
    test.describe( 'style book', () => {
        test( 'all blocks', async ( { admin } ) => {
            const siteEditorStylesPath =
                '/wp-admin/site-editor.php?path=%2Fwp_global_styles';

            await admin.page.goto( siteEditorStylesPath );
            const didLogin = await ensureLoggedIn( admin.page );

            if ( didLogin ) {
                await admin.page.goto( siteEditorStylesPath );
            }

            await admin.page.waitForLoadState( 'domcontentloaded' );

            const styleBookButton = admin.page.getByRole( 'button', {
                name: 'Style Book',
            } );

            await expect( styleBookButton ).toBeVisible( { timeout: 20000 } );
            await admin.page.waitForTimeout( 2000 );

            const getStyleBookExampleCount = async () => {
                return admin.page
                    .frameLocator( 'iframe[name="style-book-canvas"]' )
                    .locator(
                        'div.editor-style-book__example, div.edit-site-style-book__example'
                    )
                    .count();
            };

            await styleBookButton.click();

            await expect
                .poll( () => getStyleBookExampleCount(), { timeout: 20000 } )
                .toBeGreaterThan( 0 );

            const styleBookFrame = admin.page.frameLocator(
                'iframe[name="style-book-canvas"]'
            );

            const blocks = styleBookFrame.locator(
                'div.editor-style-book__example, div.edit-site-style-book__example'
            );
            const blockCount = await blocks.count();

            for ( let blockIndex = 0; blockIndex < blockCount; blockIndex++ ) {
                const block = blocks.nth( blockIndex );
                const blockName = await block.getAttribute( 'id' );

                if ( ! blockName ) {
                    continue;
                }

                const formattedName = blockName.replace( 'example-core/', '' );

                if ( excludedBlocks.includes( formattedName ) ) {
                    continue;
                }

                await block
                    .locator(
                        'div.editor-style-book__example-preview, div.edit-site-style-book__example-preview'
                    )
                    .screenshot( {
                        path:
                            'tests/screenshot/__snapshots__/style-book-' +
                            formattedName +
                            '.png',
                    } );
            }
        } );
    } );
};

/**
 * Register shared pattern screenshot tests.
 *
 * @param {Object}                options           Test registration options.
 * @param {Array<{name: string}>} options.patterns  Patterns to snapshot.
 * @param {string}                options.themeSlug Theme slug that owns the patterns.
 */
export const createPatternScreenshotTests = ( { patterns, themeSlug } ) => {
    test.describe( 'pattern', () => {
        test.beforeEach( async ( { admin } ) => {
            await admin.createNewPost();
        } );

        patterns.forEach( ( { name } ) => {
            test( name, async ( { editor } ) => {
                await editor.page
                    .getByRole( 'button', { name: 'Options', exact: true } )
                    .click();
                await editor.page
                    .getByRole( 'menuitemradio', { name: /Code editor/ } )
                    .click();
                await editor.page
                    .getByRole( 'textbox', { name: 'Type text or HTML' } )
                    .fill(
                        `<!-- wp:pattern {"slug":"${ themeSlug }/${ name }"} /-->`
                    );
                await editor.page
                    .getByRole( 'button', { name: 'Exit code editor' } )
                    .click();

                const preview = ( await editor.openPreviewPage() )
                    .locator( '.entry-content' )
                    .first();

                await expect( preview ).toHaveScreenshot();
            } );
        } );
    } );
};

export { config };
