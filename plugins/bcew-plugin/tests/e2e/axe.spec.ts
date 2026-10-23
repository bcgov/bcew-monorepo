import { expect } from '@playwright/test';
import { test } from '@bcew-monorepo/e2e';

test( 'axe fixture checks configured WCAG 2.0 A and AA rules', async ( {
    page,
    axe,
} ) => {
    await page.setContent(
        '<!doctype html><html lang="en"><head><title>Accessibility test</title></head><body><main><h1>Accessibility test</h1><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="><p style="color: #aaa; background: #fff">Low contrast text</p></main></body></html>'
    );

    const { violations } = await axe.analyze();
    const violationTags = violations.flatMap( ( violation ) => violation.tags );

    expect( violations.map( ( violation ) => violation.id ) ).toEqual(
        expect.arrayContaining( [ 'image-alt', 'color-contrast' ] )
    );
    expect( violationTags ).toContain( 'wcag2a' );
    expect( violationTags ).toContain( 'wcag2aa' );
} );
