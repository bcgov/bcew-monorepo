# Plugin Documentation Integration Plan

## Overview

This guide documents the process of integrating a new plugin's documentation into the VitePress monorepo docs site, following the established pattern used by BCEW Blocks, BCEW Plugin, and BCEW Document Repository.

## Folder Structure

Create a `docs/` folder in the plugin root with this layout:

```
plugins/{plugin-name}/docs/
├── index.md                    # Main landing page, links to user and dev docs intro files
├── user-docs.md               # User docs intro page (lists all user-facing content)
├── user/                       # User documentation folder
│   ├── Feature1.md
│   ├── Feature2.md
│   └── ...
└── developer/                  # Developer documentation folder
    ├── development-setup.md    # Build, dev, local env commands
    ├── testing.md              # Test commands
    └── ...                      # Other dev topics
```

### Key Points:

- **No duplicate files**: Do NOT create a file named the same as its parent category (e.g., no `developer/developer-docs.md`)
- **Root intro files only**: `user-docs.md` and `developer-docs.md` belong at the root level (`docs/`), not in subfolders
- **Sidebar auto-generation**: VitePress config automatically builds sidebar items from markdown files in folders, extracting titles from H1 headings
- **Files skipped**: `index.md` and `README.md` files are skipped; all other `.md` files become sidebar items

## Sidebar Pattern

The resulting sidebar appears as:

```
BCEW Search
├── Search Block                    (from user/Search.md)
├── Search Active Filters Block     (from user/SearchActiveFilters.md)
├── ... (other user docs lifted)
└── Developer Docs                  (category from /developer folder)
    ├── Development setup           (from developer/development-setup.md)
    └── Testing                     (from developer/testing.md)
```

**Behavior**:
- User doc items are lifted to the top level (not under a "User Docs" heading)
- Developer Docs is a collapsible category with no standalone link
- All sections are collapsed by default in the config

## Config Changes

The config file (`docs/.vitepress/config.mts`) includes a `packageDocsSection()` function that:

1. **Detects folders**: Checks for the presence of `user/` and `developer/` folders, not specific files
2. **Builds sidebars recursively**: Uses `buildSidebarForDir()` to scan markdown files and auto-generate sidebar structure
3. **Handles multiple plugins**: The `packageDisplayNames` object maps package names to their sidebar titles

Example detection logic:
```javascript
if (existsSync(resolve(docsDir, 'user'))) {
  // Add user docs items lifted to sidebar root level
}
if (existsSync(resolve(docsDir, 'developer'))) {
  // Add Developer Docs category
}
```

## Implementation Steps

1. **Create folder structure** in `plugins/{plugin-name}/docs/`
   - Create `user/`, `developer/` subdirectories
   - Move/reorganize docs into appropriate folders

2. **Create intro files** at root level:
   - `user-docs.md`: Overview and links to all user-facing content
   - `developer-docs.md`: Overview and links to dev guides (if needed; can skip if content is minimal)

3. **Update index.md**: Link to the intro files at root level
   ```markdown
   # Plugin Name
   - [User docs](./user-docs)
   - [Developer docs](./developer-docs) (optional)
   ```

4. **Organize topic files**:
   - Place actual user content in `user/*.md`
   - Place actual developer content in `developer/*.md`
   - Use descriptive filenames and H1 headings (they become sidebar labels)

5. **Update config** (if needed):
   - Verify the `packageDisplayNames` object has an entry for the plugin
   - Ensure the `packageDocsSection()` function handles both `user/` and `developer/` folder checks

6. **Test**:
   - Run `pnpm docs:build` to catch dead links and structural issues
   - Run `pnpm docs:dev` and navigate to the plugin to verify sidebar structure
   - Verify all links work correctly

7. **Commit and push**:
   - Include all reorganized files and config changes in one commit
   - Use clear commit message explaining the sidebar pattern

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Sidebar shows plugin as link, no children | Folders not detected by config | Verify `user/` or `developer/` folders exist; rebuild with `pnpm docs:build` |
| Duplicate category item (e.g., "Developer docs" under "Developer Docs") | File named same as parent category exists | Delete `developer/developer-docs.md`, keep root-level `developer-docs.md` only |
| Dead links in build output | Referenced files don't exist at expected paths | Check `index.md` links point to correct root-level files; verify file structure matches |
| Dev server stale pages | Hot reload cache issue | Stop and restart dev server; or run full `pnpm docs:build` then restart |

## Example: BCEW Search Integration

This was applied to integrate WordPress Search docs:

1. Reorganized existing docs into `user/` and `developer/` folders
2. Created root-level `user-docs.md` (lists all Search blocks with links)
3. Split developer content into topic files: `development-setup.md`, `testing.md`
4. Updated config to detect folders instead of specific files
5. Removed duplicate `developer-docs.md` from the `developer/` folder
6. Final sidebar shows user blocks lifted, Developer Docs as clean category

## Next Steps for New Plugins

When integrating a new plugin's docs:

1. Follow this folder structure template
2. Ensure no duplicate file names between categories and parent folders
3. Test thoroughly with `pnpm docs:build` before pushing
4. Verify sidebar expands/collapses as expected
5. Confirm all links resolve correctly

---

**Last updated**: 2026-10-15  
**Pattern reference**: BCEW Blocks, BCEW Plugin, BCEW Document Repository
