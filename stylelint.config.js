/** @type {import('stylelint').Config} */
module.exports = {
    extends: [ '@wordpress/stylelint-config/scss' ],
    ignoreFontFamilies: [ 'BCSans' ],
    ignoreFiles: [ '**/dist/**' ],
    rules: {
        // Todo: Re-enable this rule when it is introduced in higher versions of stylelint-config-wordpress.
        //'plugin-wpds/no-unknown-ds-tokens': null,
        'selector-class-pattern': null,
        'no-descending-specificity': null,
        'scss/selector-no-redundant-nesting-selector': null,
        'font-weight-notation': 'named-where-possible',
        'selector-id-pattern': null,
    },
};
