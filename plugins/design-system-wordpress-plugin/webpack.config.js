const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

const otherEntries = {
    index: [ './src/scripts/index.js', './src/styles/index.scss' ],
    'BreadCrumb/index': './src/BreadCrumb/index.js',
    'BreadCrumb/view': './src/BreadCrumb/view.js',
    'Navigation/index': './src/Navigation/index.js',
    'Navigation/view': './src/Navigation/view.js',
    'in-page-nav': [ './src/InPageNav/view.js', './src/InPageNav/style.css' ],
    'in-page-nav-editor': './src/InPageNav/edit.js',
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
