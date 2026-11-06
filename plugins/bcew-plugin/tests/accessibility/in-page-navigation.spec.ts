import { expect } from '@playwright/test';
import { test } from '@bcew-monorepo/e2e';
import { closeChoosePatternModal } from '../e2e/helpers';

test( 'In-Page Navigation has no Axe violations', async ( {
    admin,
    editor,
    axe,
} ) => {
    await admin.createNewPost( {
        postType: 'page',
        title: 'In-Page Navigation accessibility test',
        showWelcomeGuide: false,
    } );
    await editor.setContent( `
        <!-- wp:heading -->
        <h2 class="wp-block-heading">First section</h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p>Section content.</p>
        <!-- /wp:paragraph -->

        <!-- wp:heading -->
        <h2 class="wp-block-heading">Second section</h2>
        <!-- /wp:heading -->
    ` );
    await closeChoosePatternModal( editor );

    await editor.openDocumentSettingsSidebar();
    let enableCheckbox = editor.page.getByRole( 'checkbox', {
        name: 'Enable in-page navigation',
    } );
    if ( ! ( await enableCheckbox.isVisible() ) ) {
        await editor.page
            .getByRole( 'button', {
                name: 'In-page Navigation',
                exact: true,
            } )
            .click();
        enableCheckbox = editor.page.getByRole( 'checkbox', {
            name: 'Enable in-page navigation',
        } );
    }
    await enableCheckbox.check();

    const preview = await editor.openPreviewPage();
    await expect(
        preview.getByRole( 'navigation', { name: 'On this page' } )
    ).toBeVisible();

    await editor.page.goto( preview.url() );
    const { violations } = await axe.analyze();
    expect( violations ).toEqual( [] );
} );
