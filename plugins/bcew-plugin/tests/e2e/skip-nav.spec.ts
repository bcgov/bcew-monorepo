import { test, expect, Editor } from '@wordpress/e2e-test-utils-playwright';
import { Page } from '@playwright/test';

test.describe( 'SkipNav', () => {
    test.describe( 'Functionality', () => {
        test.beforeEach( async ( { admin } ) => {
            // Create a new post before each test
            await admin.createNewPost( {
                title: 'Test post',
                showWelcomeGuide: false,
            } );
        } );

        test( 'should be visible and navigable via keyboard input', async ( {
            editor,
        } ) => {
            const preview = await openPreviewAndSetFocus( editor );

            await expect(
                preview.locator( '.dswp-skip-nav-list' ).first()
            ).toBeVisible( { visible: false } );

            await preview.keyboard.press( 'Tab' );
            await expect(
                preview.getByRole( 'link', {
                    name: 'Skip to main content',
                    exact: true,
                } )
            ).toBeVisible();

            await preview.keyboard.press( 'Tab' );
            await expect(
                preview.getByRole( 'link', {
                    name: 'Skip to main navigation',
                    exact: true,
                } )
            ).toBeVisible();

            await preview.keyboard.press( 'Tab' );
            await expect(
                preview.getByRole( 'link', {
                    name: 'Accessibility Statement',
                    exact: true,
                } )
            ).toBeVisible();
        } );

        test( 'should navigate skip links in reverse order with Shift+Tab', async ( {
            editor,
        } ) => {
            const preview = await openPreviewAndSetFocus( editor );
            const linkNames = [
                'Skip to main content',
                'Skip to main navigation',
                'Accessibility Statement',
            ];

            for ( const name of linkNames ) {
                await preview.keyboard.press( 'Tab' );
                const link = preview.getByRole( 'link', {
                    name,
                    exact: true,
                } );
                await expect( link ).toBeFocused();
                await expect( link ).toBeVisible();
                await expect( link ).toBeInViewport( { ratio: 1 } );
            }

            for ( const name of linkNames.slice( 0, -1 ).reverse() ) {
                await preview.keyboard.press( 'Shift+Tab' );
                const link = preview.getByRole( 'link', {
                    name,
                    exact: true,
                } );
                await expect( link ).toBeFocused();
                await expect( link ).toBeVisible();
                await expect( link ).toBeInViewport( { ratio: 1 } );
            }
        } );

        test( 'should skip to main content', async ( { editor } ) => {
            const preview = await openPreviewAndSetFocus( editor );

            await preview.keyboard.press( 'Tab' );
            await preview.keyboard.press( 'Enter' );
            await expect( preview.url() ).toContain( '#main-content' );
        } );

        test( 'should skip to main navigation', async ( { editor } ) => {
            const preview = await openPreviewAndSetFocus( editor );

            await preview.keyboard.press( 'Tab' );
            await preview.keyboard.press( 'Tab' );
            await preview.keyboard.press( 'Enter' );
            await expect(
                preview
                    .getByRole( 'navigation' )
                    .getByRole( 'listitem' )
                    .first()
                    .getByRole( 'link' )
            ).toBeFocused();
        } );
    } );

    /**
     * Opens the preview page and sets the focus to the last element
     * of the admin bar so a tab press goes to the SkipNav next as it
     * would for a logged-out user.
     * @todo Maybe use a logged-out user browser context instead.
     *
     * @param {Editor} editor - The editor instance whose preview page should be focused.
     * @return {Promise<Page>} A promise that resolves to the preview page.
     */
    const openPreviewAndSetFocus = async (
        editor: Editor
    ): Promise< Page > => {
        const preview = await editor.openPreviewPage();
        await preview
            .getByRole( 'textbox', { name: 'Search' } )
            .first()
            .click();
        return preview;
    };
} );
