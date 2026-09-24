# BCEW Plugin Template

Look up the idea in the table. The file name is already chosen. Create that file if it is missing, then add a method. Do not invent a new file name.

Two post types are two methods in `src/PostTypes.php`. Two REST routes are two methods in `src/Rest.php`.

| The idea | File |
| --- | --- |
| Boot the plugin and call the other classes | `src/Plugin.php` |
| A custom post type | `src/PostTypes.php` |
| A taxonomy | `src/Taxonomies.php` |
| Post meta, term meta, or user meta | `src/Meta.php` |
| An admin menu or settings screen | `src/Admin.php` |
| A `/wp-json/` route | `src/Rest.php` |
| An upload or a change to the media library | `src/Media.php` |
| Work on activate or deactivate | `src/Install.php` |
| A block | `src/blocks/<block-name>/` |
| Anything else that is only a hook | `src/Plugin.php` |

A block is the one row that uses a folder. WordPress requires `block.json`, the editor script, and the styles to sit together. The block name is the name you register, not a name you make up for the folder.

`uninstall.php` stays in the plugin root. WordPress only loads it from there. Add `languages/` when the plugin has translations.
