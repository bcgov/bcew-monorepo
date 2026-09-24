# BCEW Plugin Template

Look up the idea in the table. The file name is already chosen. Create that file if it is missing, then add a method. Do not invent a new file name.

Two post types are two methods in `src/PostTypes.php`. Two REST routes are two methods in `src/Rest.php`.

The class name matches the file name. The namespace is the plugin's namespace.

| The idea | File | Class |
| --- | --- | --- |
| Boot the plugin and call the other classes | `src/Plugin.php` | `Plugin` |
| A custom post type | `src/PostTypes.php` | `PostTypes` |
| A taxonomy | `src/Taxonomies.php` | `Taxonomies` |
| Post meta, term meta, or user meta | `src/Meta.php` | `Meta` |
| An admin menu or settings screen | `src/Admin.php` | `Admin` |
| A `/wp-json/` route | `src/Rest.php` | `Rest` |
| An upload or a change to the media library | `src/Media.php` | `Media` |
| A custom database table | `src/Database.php` | `Database` |
| Work on activate or deactivate | `src/Install.php` | `Install` |
| A block | `src/blocks/<block-name>/` | none |
| Anything else that is only a hook | `src/Plugin.php` | `Plugin` |

A block is the one row that uses a folder. WordPress requires `block.json`, the editor script, and the styles to sit together. The block name is the name you register, not a name you make up for the folder.

`uninstall.php` stays in the plugin root. WordPress only loads it from there. Add `languages/` when the plugin has translations.
