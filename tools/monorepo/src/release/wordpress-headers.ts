/**
 * Rewrites the WordPress Version header in a theme style.css or plugin bootstrap.
 * Composer.json is never touched; Composer versions come from git tags and packages.json.
 */

const THEME_VERSION_PATTERN = /^Version:\s*.*$/m;
const PLUGIN_VERSION_PATTERN = /^(\s*\*\s*Version:)\s*.*$/m;

/**
 * True when the file looks like a theme stylesheet with a Version header.
 *
 * @param {string} contents File contents.
 * @return {boolean} Whether this is a theme style.css header.
 */
export const isThemeStylesheet = ( contents: string ): boolean =>
    /^Theme Name:/m.test( contents ) && THEME_VERSION_PATTERN.test( contents );

/**
 * True when the file looks like a plugin bootstrap with Plugin Name and Version.
 *
 * @param {string} contents File contents.
 * @return {boolean} Whether this is a plugin header file.
 */
export const isPluginBootstrap = ( contents: string ): boolean =>
    contents.includes( 'Plugin Name:' ) && PLUGIN_VERSION_PATTERN.test( contents );

/**
 * Replace the Version header value. Returns the original string when no header matches.
 *
 * @param {string} contents   File contents.
 * @param {string} newVersion Semver string, including prereleases like 1.2.3-alpha.1.
 * @return {string} Updated contents.
 */
export const applyWordpressHeaderVersion = (
    contents: string,
    newVersion: string
): string => {
    if ( isThemeStylesheet( contents ) ) {
        return contents.replace(
            THEME_VERSION_PATTERN,
            `Version:      ${ newVersion }`
        );
    }

    if ( isPluginBootstrap( contents ) ) {
        return contents.replace(
            PLUGIN_VERSION_PATTERN,
            `$1           ${ newVersion }`
        );
    }

    return contents;
};
