import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Verifies that the [current_year] shortcode in parts/copyright.html is
 * expanded to the actual year when rendered on the frontend.
 *
 * The copyright template part contains:
 *   © [current_year] Government of British Columbia.
 *
 * Without the render_block filter (or equivalent), [current_year] would
 * appear as a literal string instead of the resolved year.
 */
test( 'copyright template part renders current year on frontend', async ( {
    admin,
    editor,
} ) => {
    const currentYear = new Date().getFullYear().toString();

    // Create a post that embeds the copyright template part so we can
    // preview it on the frontend without needing the full footer layout.
    await admin.createNewPost();

    /*
     * createNewPost() sets welcomeGuide to false, but on a fresh site the
     * "Welcome to the block editor" dialog can still be open while
     * preferences load. Close it so Preview clicks hit the editor, not the overlay.
     */
    const welcomeGuide = editor.page.getByLabel( 'Welcome' );
    if ( await welcomeGuide.isVisible().catch( () => false ) ) {
        await editor.page.getByRole( 'button', { name: 'Close' } ).click();
        await welcomeGuide.waitFor( { state: 'hidden' } );
    }

    await editor.setContent(
        '<!-- wp:template-part {"slug":"copyright","theme":"bcew-theme"} /-->'
    );

    // Open the frontend preview.
    const previewPage = await editor.openPreviewPage();

    // The shortcode must be expanded — not the literal placeholder.
    await expect( previewPage.locator( 'body' ) ).not.toContainText(
        '[current_year]'
    );

    // The resolved year must appear in the copyright notice.
    await expect( previewPage.locator( 'body' ) ).toContainText(
        `© ${ currentYear } Government of British Columbia.`
    );

    await previewPage.close();
} );
