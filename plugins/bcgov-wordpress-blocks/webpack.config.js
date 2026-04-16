/**
 * Custom webpack configuration for the BCGov WordPress Blocks plugin.
 *
 * This file is necessary because @wordpress/scripts changes its entry point discovery behavior
 * when block.json files are present in the src directory:
 *
 * - Without block.json: Falls back to building src/index.js as the main entry point
 * - With block.json: Only builds entries based on block metadata, ignoring standalone src/index.js
 *
 * Since this plugin contains a sample-block/block.json file, we need this override to explicitly
 * include src/index.js as an additional entry point for core block variations and other
 * plugin-level editor functionality.
 *
 * Without this file, the build would only produce block-related assets and not the
 * dist/index.js and dist/index.asset.php files needed for the PHP enqueue function.
 */

const path = require( 'path' );

const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

/**
 * Adds an additional 'index' entry point to the webpack configuration.
 * This ensures src/index.js gets built alongside any block.json-based entries.
 */
const withEditorEntry = ( config ) => {
    return {
        ...config,
        entry: async () => {
            const entries =
                'function' === typeof config.entry
                    ? await config.entry()
                    : config.entry;

            return {
                ...entries,
                index: path.resolve( process.cwd(), 'src/index.js' ),
            };
        },
    };
};

/**
 * Apply the entry point override to the default @wordpress/scripts configuration.
 * Handles both single config and array of configs (for experimental modules).
 */
module.exports = Array.isArray( defaultConfig )
    ? [ withEditorEntry( defaultConfig[ 0 ] ), ...defaultConfig.slice( 1 ) ]
    : withEditorEntry( defaultConfig );
