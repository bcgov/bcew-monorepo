# User Docs

This guide explains how site administrators can add and manage CHEFS forms for use in WordPress pages and posts.
## Before you begin

Before configuring a form in WordPress, you will need:

- access to the CHEFS service
- the Form ID for the form
- the API key for the form

## CHEFS references

- CHEFS service portal: <https://submit.digital.gov.bc.ca/app>
- Use your organization's CHEFS documentation and onboarding materials to:
    - create a form
    - find the Form ID
    - generate or retrieve the API key

If you do not yet have CHEFS access or documentation links, contact your CHEFS service owner.

## Manage forms in the CHEFS Forms options page

Open WordPress Admin and go to CHEFS Forms.

### Create

1. Enter a Form ID.
2. Enter the API Key for that form.
3. Click Save.

Result:

- The form is added to the Configured Forms list.
- The Form ID becomes available in the CHEFS Form block options.

### Read

The Configured Forms table shows:

- Form ID
- Date added
- Confirmation status and actions

Note: API keys are not shown after save.

### Delete

Use Remove form in the Configured Forms table.

Result:

- The saved Form ID and API key are removed.
- The form is removed from block selection options.
- The custom confirmation for that form is also removed.

### Update behavior for Form ID and API key

There is no in-place update for Form ID or API key.

To update credentials, delete the existing form entry and add it again with the new values.

## Confirmations and how updates affect them

- You can add, edit, or remove a custom confirmation message per configured form.
- If no custom confirmation is set, a generic success message is used.
- Deleting a form removes its custom confirmation.
- Re-adding a form after deletion starts with no custom confirmation until you add one again.

## Insert a CHEFS form block on a page or post

1. Open the page or post in the block editor.
2. Insert the CHEFS Form block.
3. In the block sidebar, choose a Form ID from the dropdown.
4. Publish or update the page.

## Block options

- Form ID: selects which saved CHEFS form to embed.
- Available values come from the CHEFS Forms options page.
- If no forms are saved, the block shows a message and a link to open CHEFS settings.
- If a previously selected Form ID is deleted from settings, the block selection is cleared and must be set again.
