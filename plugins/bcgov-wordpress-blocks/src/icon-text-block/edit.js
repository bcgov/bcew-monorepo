import { __ } from '@wordpress/i18n';
import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from '@wordpress/block-editor';
/* eslint-disable import/no-extraneous-dependencies -- @wordpress/components is provided in the monorepo workspace */
import { PanelBody, RadioControl } from '@wordpress/components';
/* eslint-enable import/no-extraneous-dependencies */
import './editor.scss';

const INNER_BLOCKS_TEMPLATE = [
    [
        'bcew-blocks/icon',
        {
            lock: {
                move: true,
                remove: true,
            },
        },
    ],
    [
        'core/heading',
        {
            style: {
                spacing: {
                    margin: {
                        top: '0rem',
                        bottom: '0.75rem',
                    },
                },
            },
            lock: {
                move: true,
                remove: true,
            },
        },
    ],
    [
        'core/paragraph',
        {
            style: {
                spacing: {
                    margin: {
                        top: '0rem',
                        bottom: '0.5rem',
                    },
                },
            },
            lock: {
                move: true,
                remove: true,
            },
        },
    ],
    [
        'core/list',
        {
            style: {
                typography: {
                    lineHeight: '1.688rem',
                },
                spacing: {
                    margin: {
                        top: '0rem',
                        bottom: '1rem',
                    },
                },
            },
            lock: {
                move: true,
                remove: true,
            },
        },
    ],
    [
        'core/buttons',
        {
            lock: {
                move: true,
                remove: false,
            },
        },
    ],
];

const ALLOWED_BLOCKS = [
    'bcew-blocks/icon',
    'core/heading',
    'core/paragraph',
    'core/list',
    'core/buttons',
];

/**
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Persisted attributes.
 * @param {Function} props.setAttributes Updates attributes.
 * @return {import('react').ReactElement} Editor element.
 */
const Edit = ( { attributes = {}, setAttributes = () => {} } = {} ) => {
    const { layout } = attributes;

    const supportedLayouts = [ 'icon-left', 'icon-top' ];
    const normalizedLayout = supportedLayouts.includes( layout )
        ? layout
        : 'icon-left';
    const layoutClass = `is-layout-${ normalizedLayout }`;

    const blockProps = useBlockProps( {
        className: `bcgov-wp-blocks-icon-text-block ${ layoutClass }`,
    } );

    const innerBlocksProps = useInnerBlocksProps(
        {
            className: 'bcgov-wp-blocks-icon-text-block__layout-shell',
        },
        {
            template: INNER_BLOCKS_TEMPLATE,
            allowedBlocks: ALLOWED_BLOCKS,
            templateLock: 'insert',
        }
    );

    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Layout', 'bcew-blocks' ) } initialOpen>
                    <RadioControl
                        label={ __( 'Icon/Text arrangement', 'bcew-blocks' ) }
                        selected={ layout }
                        options={ [
                            {
                                label: __(
                                    'Icon left, content right',
                                    'bcew-blocks'
                                ),
                                value: 'icon-left',
                            },
                            {
                                label: __(
                                    'Icon top, content below',
                                    'bcew-blocks'
                                ),
                                value: 'icon-top',
                            },
                        ] }
                        onChange={ ( value ) =>
                            setAttributes( { layout: value } )
                        }
                    />
                </PanelBody>
            </InspectorControls>
            <div { ...blockProps }>
                <div { ...innerBlocksProps } />
            </div>
        </>
    );
};

export default Edit;
