# User docs

This guide explains how site administrators can add and manage existing CHEFS forms for use in WordPress pages and posts.

## Before you begin

Before configuring a form in WordPress, you will need:

- access to the CHEFS service
- a Form ID from your form
- an API key from your form
- a published version of the form in CHEFS; draft-only forms cannot be embedded

## How to get your Form ID and API key for the CHEFS plugin

Log in to the CHEFS service portal at <https://submit.digital.gov.bc.ca/app>.

### Get your Form ID

1. Go to **My Forms** and select your form.
2. Click **Manage**, then click **Share form** in the top right.
3. Copy the Form ID from the URL. For example, in `https://submit.digital.gov.bc.ca/app/form/submit?f=43cfb894-a0cf-4bef-8026-7c8001e3cdf5`, the Form ID is `43cfb894-a0cf-4bef-8026-7c8001e3cdf5`.

You can also copy the Form ID from the `f` value in the URL on the form's **Manage** page.

Make sure the form has been published in CHEFS before adding it to WordPress.
The WordPress integration requires a published version to load the form; a
form that only has draft versions cannot be saved or embedded.

### Get your API key

1. Close the sharing popup, if it is open.
2. Expand the **API Key** accordion below the **Form Settings** accordion.
3. Click the **Eye** button to reveal the API key.
4. Click **Copy**.

Return to WordPress Admin and enter the Form ID and API key in the new form entry.

## Manage forms in the CHEFS Forms options page

Open WordPress Admin and go to CHEFS Forms.

### Add a new form

1. Enter a Form ID.
2. Enter the API Key for that form.
3. Click **Save**.

CHEFS validates the Form ID and API key before WordPress saves them. If the
credentials are invalid, the form is not added or updated. You may see an
error when the Form ID cannot be found, the API key is invalid, or CHEFS is
temporarily unavailable, or the form has no published version.

After you save:

- CHEFS confirms the credentials and the form title is stored in WordPress.
- The form title is shown in the Configured Forms list, with the Form ID
  retained for support.
- The form title becomes available in the CHEFS Form block options.

If CHEFS cannot confirm the credentials, the form is not saved.

The Configured Forms table includes:

- Form ID
- Form title
- Date added
- Confirmation message
- Actions:
    - Remove form
    - Edit confirmation

Note: API keys are hidden for security reasons.

### Remove a form

Click **Remove form** next to the form you want to remove. A confirmation dialog
asks you to confirm this cannot be undone. Choose **Cancel** to keep the form,
or **OK** to remove it.

After you confirm removal:

- The saved Form ID and API key are removed.
- The form is removed from block selection options.
- The custom confirmation for that form is also removed.

Note: Removing a form here does not delete the form in CHEFS. Any WordPress
page embedding it will show an error until the form is saved again or the
block is removed.

### Update an API key or change a Form ID

To update an API key, enter the same Form ID with the new API key and click
**Save**. CHEFS validates the replacement credentials before WordPress updates
the saved form.

Updating the API key does not change the saved form title, custom confirmation,
or block embed settings. Only the credentials for that Form ID are replaced.

If validation fails, the existing saved Form ID and API key remain unchanged.

To change the Form ID, first remove the old form from the Configured Forms list,
then add the new Form ID and its API key as a new form. Saving a different Form
ID creates an additional configured form; it does not replace the existing row,
so the old Form ID remains available in the block picker until you remove it.

## Manage confirmation messages

- Add, edit, or remove a custom confirmation message for each configured form.
- If no custom confirmation is set, a generic success message is used.
- Deleting a form removes its custom confirmation.
- Re-adding a form starts without a custom confirmation.
- Clicking **Remove custom confirmation** asks for confirmation. Choose
  **Cancel** to keep the custom message, or **OK** to remove it and use the
  generic success message again.

## Add a CHEFS form block to a page or post

1. Open the page or post in the block editor.
2. Insert the CHEFS Form block.
3. In the block sidebar, choose a Form ID from the dropdown.
4. Publish or update the page.

## Block options

- **Form name:** Selects which saved CHEFS form to embed.
- Available values come from the CHEFS Forms options page.
- The Form ID remains the saved block value so the correct form is embedded.
- If no forms are saved, the block shows a message and a link to open CHEFS settings.
- If a selected Form ID is deleted from settings, the block selection is cleared and must be set again.
