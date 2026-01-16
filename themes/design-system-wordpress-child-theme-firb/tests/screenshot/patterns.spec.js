import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('pattern', () => {
	// TODO: Run e2e tests in Playwright Docker container for consistency.
	const SCREENSHOT_OPTIONS = { maxDiffPixelRatio: 0.02 };

	test.beforeEach(async ({ admin }) => {
		// Create a new post before each test
		await admin.createNewPost();
	});

	[
		{ name: 'firb-bullet-list' },
		{ name: 'firb-call-to-action-short' },
		{ name: 'firb-columns-with-headings-h2-h3' },
		{ name: 'firb-columns-with-headings-h3-h4' },
		{ name: 'firb-icon-with-excerpt-single' },
		{ name: 'firb-paragraph' },
		{ name: 'firb-subheading-h3-h4-with-paragraphs' },
	].forEach(({ name }) => {
		test(name, async ({ editor }) => {
			// TODO: There's probably a faster way to add a pattern than this.
			await editor.page
				.getByRole('button', { name: 'Options', exact: true })
				.click();
			await editor.page
				.getByRole('menuitemradio', { name: /Code editor/ })
				.click();
			await editor.page
				.getByRole('textbox', { name: 'Type text or HTML' })
				.fill(
					`<!-- wp:pattern {"slug":"design-system-wordpress-child-theme-firb/${name}"} /-->`
				);
			await editor.page
				.getByRole('button', { name: 'Exit code editor' })
				.click();
			const preview = (await editor.openPreviewPage())
				.locator('.entry-content')
				.first();
			await expect(preview).toHaveScreenshot(SCREENSHOT_OPTIONS);
		});
	});
});
