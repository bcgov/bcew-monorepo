/**
 * Shared Playwright test utilities for the BCEW monorepo.
 *
 * Common helpers for e2e tests across themes and plugins.
 */

import { expect, Page } from '@playwright/test';
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
    const previewPage = await editor.openPreviewPage();

    await previewPage.waitForLoadState( 'domcontentloaded' );

    const preview = previewPage.locator( '.entry-content' ).first();

    await expect( preview ).toBeVisible( { timeout: 15000 } );

    await previewPage.evaluate( async () => {
        await document.fonts.ready;

        await Promise.all(
            Array.from( document.images )
                .filter( ( image ) => ! image.complete )
                .map(
                    ( image ) =>
                        new Promise< void >( ( resolve ) => {
                            image.addEventListener( 'load', resolve, {
                                once: true,
                            } );
                            image.addEventListener( 'error', resolve, {
                                once: true,
                            } );
                            setTimeout( resolve, 5000 );
                        } )
                )
        );
    } );

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

const STYLEBOOK_SELECTED_PREVIEW_SELECTOR = [
    '[aria-selected="true"] div.edit-site-style-book__example-preview',
    '[aria-selected="true"] div.editor-style-book__example-preview',
    '.is-selected div.edit-site-style-book__example-preview',
    '.is-selected div.editor-style-book__example-preview',
    'div.edit-site-style-book__example-preview',
    'div.editor-style-book__example-preview',
].join( ', ' );

const waitForStylebookResources = async ( canvas: any ): Promise< void > => {
    await canvas.locator( 'body' ).evaluate( async ( body: HTMLElement ) => {
        await document.fonts.ready;

        const images = Array.from(
            body.querySelectorAll( 'img' )
        ) as HTMLImageElement[];

        await Promise.all(
            images.map( ( image ) =>
                image.complete
                    ? Promise.resolve()
                    : new Promise< void >( ( resolve ) => {
                          image.addEventListener( 'load', resolve, {
                              once: true,
                          } );
                          image.addEventListener( 'error', resolve, {
                              once: true,
                          } );
                          setTimeout( resolve, 5000 );
                      } )
            )
        );
    } );
};

/**
 * Wait for the style book canvas height to stabilize.
 *
 * @param {any} canvasFrame Canvas iframe element.
 */
const waitForCanvasHeightStability = async (
    canvasFrame: any
): Promise< void > => {
    let previousScrollHeight = await canvasFrame.evaluate(
        () => document.body.scrollHeight
    );
    let stableSamples = 0;

    for ( let sampleIndex = 0; sampleIndex < 30; sampleIndex++ ) {
        await canvasFrame.page().waitForTimeout( 150 );

        const currentScrollHeight = await canvasFrame.evaluate(
            () => document.body.scrollHeight
        );

        if ( currentScrollHeight === previousScrollHeight ) {
            stableSamples++;

            if ( stableSamples >= 4 ) {
                break;
            }
        } else {
            stableSamples = 0;
            previousScrollHeight = currentScrollHeight;
        }
    }

    if ( stableSamples < 4 ) {
        throw new Error(
            'Style book canvas height did not stabilize before screenshot capture.'
        );
    }
};

/**
 * Render single selected preview (fallback for newer WordPress versions).
 *
 * @param {any} canvas Canvas frame locator.
 * @param {any} admin  Admin fixture object.
 */
const renderSinglePreview = async (
    canvas: any,
    admin: any
): Promise< void > => {
    await admin.page.waitForTimeout( 300 );

    const selectedPreview = canvas
        .locator( STYLEBOOK_SELECTED_PREVIEW_SELECTOR )
        .first();

    await expect( selectedPreview ).toBeVisible();
    await expect( selectedPreview ).toHaveScreenshot(
        'style-book-overview.png',
        {
            maxDiffPixelRatio: 0.01,
        }
    );
};

/**
 * Render all blocks in the style book grid.
 *
 * @param {any} blocks Blocks locator.
 */
const renderBlocksGrid = async ( blocks: any ): Promise< void > => {
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

        const preview = block.locator( STYLEBOOK_PREVIEW_SELECTOR );

        await expect( preview ).toBeVisible( { timeout: 15000 } );

        // Wait for block to stabilize before taking screenshot
        try {
            const previewHandle = await preview.elementHandle();
            await previewHandle.waitForElementState( 'stable', {
                timeout: 5000,
            } );
        } catch {
            // If stability timeout occurs, still proceed with screenshot
            // (some blocks may not stabilize but are still renderable)
        }

        // Add a brief wait for lazy-loaded images (galleries, etc) to paint.
        // Timeouts quickly to prevent blocking; partial loads are acceptable.
        try {
            await preview.evaluate(
                ( previewElement ) => {
                    const images = Array.from(
                        previewElement.querySelectorAll( 'img' )
                    );

                    return Promise.race( [
                        Promise.all(
                            images.map( ( image ) =>
                                image.complete
                                    ? Promise.resolve()
                                    : new Promise< void >( ( resolve ) => {
                                          image.addEventListener(
                                              'load',
                                              resolve,
                                              {
                                                  once: true,
                                              }
                                          );
                                          image.addEventListener(
                                              'error',
                                              resolve,
                                              {
                                                  once: true,
                                              }
                                          );
                                      } )
                            )
                        ),
                        new Promise< void >( ( resolve ) =>
                            setTimeout( resolve, 2000 )
                        ),
                    ] );
                },
                { timeout: 2500 }
            );
        } catch {
            // Non-fatal timeout; proceed with screenshot anyway
        }

        await expect( preview ).toHaveScreenshot(
            `style-book-${ formattedName }.png`,
            {
                animations: 'disabled',
                caret: 'hide',
                scale: 'css',
                maxDiffPixelRatio: 0.02,
                timeout: 15000,
            }
        );
    }
};

/**
 * Render the WordPress style book and save screenshots for each example.
 *
 * @param {any} admin Admin fixture object.
 */
export const renderStylebook = async ( admin: any ) => {
    await admin.visitAdminPage( 'site-editor.php', 'path=%2Fwp_global_styles' );

    await admin.page.waitForTimeout( 2000 );
    await admin.page.getByRole( 'button', { name: 'Style Book' } ).click();

    const blocksButton = admin.page.getByRole( 'button', { name: 'Blocks' } );
    if ( ( await blocksButton.count() ) > 0 ) {
        await blocksButton.first().click();
    }

    const canvas = admin.page.frameLocator(
        'iframe[name="style-book-canvas"]'
    );

    await expect(
        admin.page.locator( 'iframe[name="style-book-canvas"]' )
    ).toBeVisible( { timeout: 30000 } );

    await expect( canvas.locator( 'body' ) ).toBeVisible( {
        timeout: 15000,
    } );

    const blocks = canvas.locator( STYLEBOOK_EXAMPLE_SELECTOR );

    try {
        await expect
            .poll( () => blocks.count(), {
                timeout: 15000,
                message:
                    'Expected style book examples to render in style-book-canvas iframe.',
            } )
            .toBeGreaterThan( 0 );
    } catch {
        const canvasFrame = admin.page.frame( { name: 'style-book-canvas' } );

        if ( ! canvasFrame ) {
            throw new Error( 'Style book canvas iframe was not found.' );
        }

        await canvasFrame.waitForSelector( 'body' );

        // Wait until the style book canvas height settles before capturing.
        await waitForCanvasHeightStability( canvasFrame );

        // Render single selected preview (fallback).
        await renderSinglePreview( canvas, admin );

        return;
    }

    await waitForStylebookResources( canvas );
    await renderBlocksGrid( blocks );
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
            // Ensure WordPress is fully initialized before creating post
            await admin.page.waitForTimeout( 1000 );

            // Retry logic for createNewPost to handle initialization timing
            let attempt = 0;
            const maxAttempts = 3;

            while ( attempt < maxAttempts ) {
                try {
                    await admin.createNewPost();
                    break;
                } catch ( error ) {
                    attempt++;

                    if ( attempt >= maxAttempts ) {
                        throw new Error(
                            `Failed to create new post after ${ maxAttempts } attempts: ${ error.message }`
                        );
                    }

                    // Wait and retry
                    await admin.page.waitForTimeout( 2000 );
                }
            }
        } );

        for ( const p of patterns ) {
            test( p, async ( { editor } ) => {
                await renderPattern( editor, `${ themeSlug }/${ p }` );
            } );
        }
    } );
};

export { config };
