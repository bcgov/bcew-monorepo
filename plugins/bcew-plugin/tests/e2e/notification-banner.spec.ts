import { test, expect } from '@wordpress/e2e-test-utils-playwright';
import { Page } from '@playwright/test';

test.describe( 'NotificationBanner', () => {
    // =====================
    // Constants
    // =====================

    const BANNER_COLORS: Array< {
        name: string;
        cssVar: string | null;
        literalValue?: string;
    } > = [
        { name: 'Warning', cssVar: '--dswp-icons-color-warning' },
        { name: 'Danger', cssVar: '--dswp-icons-color-danger' },
        { name: 'Success', cssVar: '--dswp-icons-color-success' },
        { name: 'Info', cssVar: '--dswp-icons-color-info' },
        { name: 'Black', cssVar: null, literalValue: '#2d2d2d' },
    ];

    const SELECTORS = {
        banner: '#dswp-notification-banner',
        previewSection: '#dswp-banner-preview',
        enableRadio: { role: 'radio' as const, name: 'Enable' },
        disableRadio: { role: 'radio' as const, name: 'Disable' },
        contentTextarea: { role: 'textbox' as const },
        saveButton: { role: 'button' as const, name: 'Save Settings' },
    };

    const MESSAGES = {
        testMessage: 'Test Notification Message',
        customMessage: 'This is a custom notification',
        disabledPreview: 'This is a disabled banner preview',
        htmlContent: '<span><b>Test</b></span> message with <em>emphasis</em>',
    };

    // =====================
    // Helper Functions
    // =====================

    /**
     * Save notification banner settings and wait for the request to complete.
     *
     * @param {Page} page - The admin page object.
     * @return {Promise<void>} Promise that resolves after settings are saved.
     */
    const saveSettingsAndWait = async ( page: Page ): Promise< void > => {
        await page
            .getByRole( SELECTORS.saveButton.role, {
                name: SELECTORS.saveButton.name,
            } )
            .click();
        await page.locator( '.notice-success, .updated.notice' ).first();
    };

    /**
     * Enable the notification banner setting.
     *
     * @param {Page} page - The admin page object.
     * @return {Promise<void>} Promise that resolves after the banner is enabled.
     */
    const enableBanner = async ( page: Page ): Promise< void > => {
        await page
            .getByRole( SELECTORS.enableRadio.role, {
                name: SELECTORS.enableRadio.name,
            } )
            .check();
    };

    /**
     * Disable the notification banner setting.
     *
     * @param {Page} page - The admin page object.
     * @return {Promise<void>} Promise that resolves after the banner is disabled.
     */
    const disableBanner = async ( page: Page ): Promise< void > => {
        await page
            .getByRole( SELECTORS.disableRadio.role, {
                name: SELECTORS.disableRadio.name,
            } )
            .check();
    };

    /**
     * Select a notification banner color option.
     *
     * @param {Page}   page      - The admin page object.
     * @param {string} colorName - The color option label to select.
     * @return {Promise<void>} Promise that resolves after the color is selected.
     */
    const selectColor = async (
        page: Page,
        colorName: string
    ): Promise< void > => {
        await page.getByRole( 'radio', { name: colorName } ).check();
    };

    /**
     * Fill the notification banner content field.
     *
     * @param {Page}   page    - The admin page object.
     * @param {string} content - The content to place in the banner.
     * @return {Promise<void>} Promise that resolves after the content is entered.
     */
    const fillContent = async (
        page: Page,
        content: string
    ): Promise< void > => {
        await page.getByRole( SELECTORS.contentTextarea.role ).fill( content );
    };

    /**
     * Open the public frontend in a new browser page.
     *
     * @param {Page} page - The current admin page object.
     * @return {Promise<Page>} Promise that resolves to the frontend page.
     */
    const visitFrontend = async ( page: Page ): Promise< Page > => {
        const frontend = await page.context().newPage();
        await frontend.goto( '/' );
        return frontend;
    };

    /**
     * Assert that the notification banner is visible.
     *
     * @param {Page} frontend - The frontend page object.
     * @return {Promise<import('@playwright/test').Locator>} Promise that resolves to the banner locator.
     */
    const assertBannerVisible = async ( frontend: Page ) => {
        const banner = frontend.locator( SELECTORS.banner );
        await expect( banner ).toBeVisible();
        return banner;
    };

    /**
     * Assert that the notification banner is not rendered.
     *
     * @param {Page} frontend - The frontend page object.
     * @return {Promise<void>} Promise that resolves after the assertion completes.
     */
    const assertBannerNotRendered = async (
        frontend: Page
    ): Promise< void > => {
        const banner = frontend.locator( SELECTORS.banner );
        await expect( banner ).toHaveCount( 0 );
    };

    /**
     * Build a regular expression for a notification banner background color.
     *
     * @param {Object} color - Notification banner color data.
     * @return {RegExp} Regular expression matching the banner background color.
     */
    const getBackgroundColorRegex = (
        color: ( typeof BANNER_COLORS )[ 0 ]
    ): RegExp => {
        if ( color.literalValue ) {
            return new RegExp(
                `background-color:\\s*${ color.literalValue.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    '\\$&'
                ) }`
            );
        }
        return new RegExp( `background-color:\\s*var\\(${ color.cssVar }\\)` );
    };

    // =====================
    // Tests
    // =====================

    test.beforeEach( async ( { admin } ) => {
        // Navigate to the notification banner settings page
        await admin.visitAdminPage( 'admin.php?page=dswp-notification-menu' );
    } );

    test.describe( 'Visibility', () => {
        test( 'Banner should not display when disabled', async ( { page } ) => {
            await disableBanner( page );
            await saveSettingsAndWait( page );

            const frontend = await visitFrontend( page );
            await assertBannerNotRendered( frontend );
            await frontend.close();
        } );

        test( 'Banner should not render if it has empty content', async ( {
            page,
        } ) => {
            await enableBanner( page );
            await fillContent( page, '' );
            await saveSettingsAndWait( page );

            const frontend = await visitFrontend( page );
            const banner = frontend.locator( '#dswp-notification-banner' );
            await expect( banner ).toHaveCount( 0, { timeout: 10000 } );
            await frontend.close();
        } );

        test( 'Banner should display with message and default color', async ( {
            page,
        } ) => {
            await enableBanner( page );
            await selectColor( page, 'Warning' );
            await fillContent( page, MESSAGES.testMessage );
            await saveSettingsAndWait( page );

            const frontend = await visitFrontend( page );
            await expect(
                frontend.locator( `text=${ MESSAGES.testMessage }` )
            ).toBeVisible();
            const banner = await assertBannerVisible( frontend );
            await expect( banner ).toHaveAttribute(
                'style',
                getBackgroundColorRegex( BANNER_COLORS[ 0 ] )
            );
            await frontend.close();
        } );
    } );

    test( 'Banner should display with message and each color', async ( {
        page,
    } ) => {
        for ( const color of BANNER_COLORS ) {
            await enableBanner( page );
            await selectColor( page, color.name );
            const message = `${ MESSAGES.testMessage } - ${ color.name }`;
            await fillContent( page, message );
            await saveSettingsAndWait( page );

            const frontend = await visitFrontend( page );
            await expect(
                frontend.locator( `text=${ message }` )
            ).toBeVisible();
            const banner = await assertBannerVisible( frontend );
            await expect( banner ).toHaveAttribute(
                'style',
                getBackgroundColorRegex( color )
            );
            await frontend.close();
        }
    } );

    test.describe( 'Admin Preview', () => {
        test( 'Preview should be displayed even if banner is disabled', async ( {
            page,
        } ) => {
            await disableBanner( page );
            await selectColor( page, 'Danger' );
            await fillContent( page, MESSAGES.disabledPreview );
            await saveSettingsAndWait( page );

            const preview = page.locator( '#dswp-banner-preview' );
            await expect( preview ).toBeVisible();
            const previewBanner = preview.locator(
                'div[style*="background-color"]'
            );
            await expect( previewBanner ).toBeVisible();
            await expect( previewBanner ).toContainText(
                MESSAGES.disabledPreview
            );
            await expect(
                page.locator(
                    'text=/This banner is disabled and will NOT display/'
                )
            ).toBeVisible();
        } );
    } );

    test.describe( 'Content', () => {
        test( 'should display banner with custom message', async ( {
            page,
        } ) => {
            await enableBanner( page );
            await fillContent( page, MESSAGES.customMessage );
            await saveSettingsAndWait( page );

            const frontend = await visitFrontend( page );
            await expect(
                frontend.locator( `text=${ MESSAGES.customMessage }` )
            ).toBeVisible();
            await frontend.close();
        } );

        test( 'should render HTML content correctly in banner', async ( {
            page,
        } ) => {
            await enableBanner( page );
            await fillContent( page, MESSAGES.htmlContent );
            await saveSettingsAndWait( page );

            const frontend = await visitFrontend( page );
            const banner = await assertBannerVisible( frontend );
            await expect( banner.locator( 'b' ) ).toContainText( 'Test' );
            await expect( banner.locator( 'em' ) ).toContainText( 'emphasis' );
            await expect( banner ).toContainText( 'Test' );
            await expect( banner ).toContainText( 'message with' );
            await frontend.close();
        } );
    } );
} );
