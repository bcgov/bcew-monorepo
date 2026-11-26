const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

const otherEntries = {
    index: [ './src/index.js' ],
    'query-template/index': './src/query-template/index.js',
};

const otherConfig = {
    ...defaultConfig,
    entry: otherEntries,
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: '[name].js',
    },
};
module.exports = otherConfig;
