# Icon

Displays a single icon with configurable size and accessibility labeling.

## Notes

- Block name: `bcew-blocks/icon`
- Category: `media`
- Intended use: visual icon element in content layouts

## Attributes

- `iconId` (`string`): selected icon identifier
- `iconSize` (`string`, default `medium`): display size
- `isDecorative` (`boolean`, default `false`): whether assistive tech should ignore the icon
- `accessibleName` (`string`): accessible text label when icon is not decorative

## Accessibility

- When `isDecorative` is `true`, the icon should not require an accessible name.
- When `isDecorative` is `false`, provide a meaningful `accessibleName`.
