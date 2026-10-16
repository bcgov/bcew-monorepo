# Manage forms in the CHEFS Forms options page

Open WordPress Admin and go to CHEFS Forms.

## Add a new form

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

## Remove a form

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

## Update an API key or change a Form ID

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
