/**
 * Earlier versions of the block were server-rendered only and saved no
 * markup. Keep them valid so existing posts upgrade to save.js markup.
 */
const v1 = {
    attributes: {
        formId: {
            type: 'string',
            default: '',
        },
    },
    supports: {
        html: false,
    },
    save: () => null,
};

export default [ v1 ];
