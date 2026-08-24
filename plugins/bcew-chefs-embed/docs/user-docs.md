# User docs

This guide explains how site administrators can add and manage existing CHEFS forms for use in WordPress pages and posts.

## Before you begin

Before configuring a form in WordPress, you will need:

- access to the CHEFS service
- a Form ID from your form
- an API key from your form

## How to get your Form ID and API key for the CHEFS plugin

Log in to the CHEFS service portal at <https://submit.digital.gov.bc.ca/app>.

### Get your Form ID

1. Go to **My Forms** and select your form.
2. Click **Manage**, then click **Share form** in the top right.
3. Copy the Form ID from the URL. For example, in `https://submit.digital.gov.bc.ca/app/form/submit?f=43cfb894-a0cf-4bef-8026-7c8001e3cdf5`, the Form ID is `43cfb894-a0cf-4bef-8026-7c8001e3cdf5`.

You can also copy the Form ID from the `f` value in the URL on the form's **Manage** page.

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

After you save:

- The form is added to the Configured Forms list.
- The Form ID becomes available in the CHEFS Form block options.

The Configured Forms table includes:

- Form ID
- Date added
- Confirmation message
- Actions:
    - Remove form
    - Edit confirmation

Note: API keys are hidden for security reasons.

### Remove a form

Click **Remove form** next to the form you want to remove.

After you remove a form:

- The saved Form ID and API key are removed.
- The form is removed from block selection options.
- The custom confirmation for that form is also removed.

### Update a Form ID or API key

There is no in-place update for Form ID or API key.

To update credentials, delete the existing form and add it again with the new values.

## Manage confirmation messages

- Add, edit, or remove a custom confirmation message for each configured form.
- If no custom confirmation is set, a generic success message is used.
- Deleting a form removes its custom confirmation.
- Re-adding a form starts without a custom confirmation.

## Add a CHEFS form block to a page or post

1. Open the page or post in the block editor.
2. Insert the CHEFS Form block.
3. In the block sidebar, choose a Form ID from the dropdown.
4. Publish or update the page.

## Block options

- **Form ID:** Selects which saved CHEFS form to embed.
- Available values come from the CHEFS Forms options page.
- If no forms are saved, the block shows a message and a link to open CHEFS settings.
- If a selected Form ID is deleted from settings, the block selection is cleared and must be set again.
