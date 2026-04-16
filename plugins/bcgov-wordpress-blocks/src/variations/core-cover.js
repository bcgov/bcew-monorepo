import domReady from '@wordpress/dom-ready';
import { registerBlockVariation } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

domReady( () => {
    registerBlockVariation( 'core/cover', {
        name: 'hero-image',
        title: __( 'Hero Image', 'bcgov-wordpress-blocks' ),
        description: __(
            'A Hero Image variation on the cover block',
            'bcgov-wordpress-blocks'
        ),
        scope: [ 'inserter' ],
        isDefault: false,
        attributes: {
            align: 'full',
            layout: {
                type: 'constrained',
                contentSize: '468px',
            },
        },
        innerBlocks: [
            [
                'core/group',
                {
                    layout: {
                        type: 'constrained',
                        contentSize: '468px',
                    },
                    style: {
                        color: {
                            background: '#013366B3',
                        },
                        border: {
                            left: {
                                width: '0.5rem',
                                color: '#fcba19',
                                style: 'solid',
                            },
                        },
                    },
                },
                [
                    [
                        'core/heading',
                        {
                            level: 1,
                            content: 'Hero title',
                            style: {
                                color: {
                                    text: '#ffffff',
                                },
                            },
                        },
                    ],
                    [
                        'core/paragraph',
                        {
                            content: 'Hero description',
                            style: {
                                color: {
                                    text: '#ffffff',
                                },
                            },
                        },
                    ],
                    [
                        'core/paragraph',
                        {
                            content:
                                'Visit <a href="/some-page">another page</a>',
                            style: {
                                color: {
                                    text: '#ffffff',
                                },
                            },
                        },
                    ],
                ],
            ],
        ],
        icon: 'star-filled',
    } );
} );
