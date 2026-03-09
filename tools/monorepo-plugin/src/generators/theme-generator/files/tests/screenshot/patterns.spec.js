import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('pattern', () => {
	test.beforeEach(async ({ admin }) => {
		// Create a new post before each test
		await admin.createNewPost();
	});

	[
		{ name: 'sample' },
	].forEach(({ name }) => {
		test(name, async ({ editor }) => {
			await editor.page
				.getByRole('button', { name: 'Options', exact: true })
				.click();
			await editor.page
				.getByRole('menuitemradio', { name: /Code editor/ })
				.click();
			await editor.page
				.getByRole('textbox', { name: 'Type text or HTML' })
				.fill(
					`<!-- wp:pattern {"slug":"<%= slug %>/${name}"} /-->`
				);
			await editor.page
				.getByRole('button', { name: 'Exit code editor' })
				.click();
			const preview = (await editor.openPreviewPage())
				.locator('.entry-content')
				.first();
			await expect(preview).toHaveScreenshot();
		});
	});
});
