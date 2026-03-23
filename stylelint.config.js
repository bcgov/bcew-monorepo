/** @type {import('stylelint').Config} */
module.exports = {
    extends: [ '@wordpress/stylelint-config/scss' ],
    ignoreFontFamilies: [ 'BCSans' ],
    ignoreFiles: [ '**/dist/**', 'tools/monorepo-plugin/src/generators/plugin-generator/files/**' ],
    rules: {
        'plugin-wpds/no-unknown-ds-tokens': null,
        'selector-class-pattern': null,
        'no-descending-specificity': null,
        'scss/selector-no-redundant-nesting-selector': null,
        'font-weight-notation': 'named-where-possible',
        'selector-id-pattern': null,
    },
};
