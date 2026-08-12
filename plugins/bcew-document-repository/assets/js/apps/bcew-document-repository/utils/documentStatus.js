/**
 * Returns true if the current status filter is 'trash'.
 * @param {string} status - The status filter to check
 * @return {boolean} True if the status is 'trash', false otherwise
 */
export const isTrashView = ( status ) => {
    return 'trash' === status;
};

/**
 * Returns true if the current status filter is 'all'.
 * @param {string} status - The status filter to check
 * @return {boolean} True if the status is 'all', false otherwise
 */
export const isAllView = ( status ) => {
    return 'all' === status;
};
