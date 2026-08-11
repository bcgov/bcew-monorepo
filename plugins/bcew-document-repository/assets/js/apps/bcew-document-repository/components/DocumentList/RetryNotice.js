import { JSX } from 'react';
import { Button, Notice } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

/**
 * RetryNotice Component
 *
 * Displays a notice for operations that can be retried
 *
 * @param {Object}   props                  - Component props
 * @param {Array}    props.failedOperations - Array of failed operations
 * @param {Function} props.onRetryAll       - Callback when retry all button is clicked
 * @return {JSX.Element|null} Retry notice or null if no failed operations
 */
const RetryNotice = ( { failedOperations, onRetryAll } ) => {
    if ( 0 === failedOperations.length ) {
        return null;
    }

    return (
        <Notice
            status="warning"
            isDismissible={ false }
            className="retry-notice"
        >
            <p>
                { sprintf(
                    /* translators: %d: number of failed operations */
                    __(
                        'There are %d failed operations that can be retried.',
                        'bcgov-design-system'
                    ),
                    failedOperations.length
                ) }
            </p>
            <Button variant="secondary" onClick={ onRetryAll }>
                { __( 'Retry All', 'bcgov-design-system' ) }
            </Button>
        </Notice>
    );
};

export default RetryNotice;
