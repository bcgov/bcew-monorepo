/**
 * WordPress dependencies
 */
import {
    useBlockProps,
    useInnerBlocksProps,
    InspectorControls,
    store as blockEditorStore,
} from '@wordpress/block-editor';
/* eslint-disable import/no-extraneous-dependencies -- @wordpress/components is provided in the monorepo workspace */
import {
    PanelBody,
    SelectControl,
    RangeControl,
    ToggleControl,
} from '@wordpress/components';
/* eslint-enable import/no-extraneous-dependencies */
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
    CARD_BLOCK,
    CARD_CONTENT_TYPES,
    DEFAULT_CARD_CONTENT_TYPE,
    DEFAULT_CARD_COUNT,
    MAX_CARD_SLOTS,
    MIN_CARD_SLOTS,
} from './constants';

const ALLOWED_BLOCKS = [ CARD_BLOCK ];
const ICON_TEXT_BLOCK = CARD_CONTENT_TYPES[ 'icon-text' ];
const MEDIA_TEXT_BLOCK = CARD_CONTENT_TYPES[ 'media-text' ];
const CONTENT_BLOCKS = new Set( [ ICON_TEXT_BLOCK, MEDIA_TEXT_BLOCK ] );

/**
 * Builds the initial inner-block template: one card slot per `cardCount`,
 * each seeded with the chosen content type.
 *
 * @param {number} cardCount   Number of card slots.
 * @param {string} contentType Card content type key.
 * @return {Array} Inner-block template.
 */
const buildTemplate = ( cardCount, contentType ) =>
    Array.from( { length: cardCount }, () => [ CARD_BLOCK, { contentType } ] );

/**
 * @param {Object}   props               Block props.
 * @param {string}   props.clientId      Block client ID.
 * @param {Object}   props.attributes    Persisted attributes.
 * @param {Function} props.setAttributes Updates attributes.
 * @return {import('react').ReactElement} Editor element.
 */
const Edit = ( { clientId, attributes, setAttributes } ) => {
    const {
        cardCount = DEFAULT_CARD_COUNT,
        contentType,
        boxShadow,
        showParagraph,
        showList,
    } = attributes;
    const normalizedType = CARD_CONTENT_TYPES[ contentType ]
        ? contentType
        : DEFAULT_CARD_CONTENT_TYPE;

    const { replaceInnerBlocks, updateBlockAttributes } =
        useDispatch( blockEditorStore );
    const cardBlocks = useSelect(
        ( select ) => select( blockEditorStore ).getBlocks( clientId ),
        [ clientId ]
    );

    // The content toggles are single, row-level settings: mirror them onto every
    // content block in the row so they always match (including cards added after
    // a toggle was set). Box shadow is controlled on this block only.
    useEffect( () => {
        cardBlocks.forEach( ( card ) => {
            card.innerBlocks?.forEach( ( inner ) => {
                if ( ! CONTENT_BLOCKS.has( inner.name ) ) {
                    return;
                }

                const updates = {};
                if ( inner.attributes?.showParagraph !== showParagraph ) {
                    updates.showParagraph = showParagraph;
                }
                if ( inner.attributes?.showList !== showList ) {
                    updates.showList = showList;
                }

                if ( Object.keys( updates ).length > 0 ) {
                    updateBlockAttributes( inner.clientId, updates );
                }
            } );
        } );
    }, [ showParagraph, showList, cardBlocks, updateBlockAttributes ] );

    const blockProps = useBlockProps( {
        className: `bcew-blocks-cards bcew-blocks-cards--count-${ cardCount } bcew-blocks-cards--type-${ normalizedType }${
            boxShadow ? ' has-box-shadow' : ''
        }`,
    } );
    const innerBlocksProps = useInnerBlocksProps( blockProps, {
        allowedBlocks: ALLOWED_BLOCKS,
        template: buildTemplate( cardCount, normalizedType ),
        orientation: 'horizontal',
    } );

    const onChangeCardCount = ( value ) => {
        const clamped = Math.min(
            Math.max( value, MIN_CARD_SLOTS ),
            MAX_CARD_SLOTS
        );
        setAttributes( { cardCount: clamped } );

        let nextCards = cardBlocks.slice( 0, clamped );
        while ( nextCards.length < clamped ) {
            nextCards = [
                ...nextCards,
                createBlock( CARD_BLOCK, { contentType: normalizedType } ),
            ];
        }
        replaceInnerBlocks( clientId, nextCards, false );
    };

    const onChangeContentType = ( value ) => {
        setAttributes( { contentType: value } );
        cardBlocks.forEach( ( card ) => {
            updateBlockAttributes( card.clientId, { contentType: value } );
            replaceInnerBlocks(
                card.clientId,
                [ createBlock( CARD_CONTENT_TYPES[ value ] ) ],
                false
            );
        } );
    };

    return (
        <>
            <InspectorControls>
                <PanelBody
                    title={ __( 'Card content', 'bcew-blocks' ) }
                    initialOpen
                >
                    <SelectControl
                        label={ __( 'Content type', 'bcew-blocks' ) }
                        help={ __(
                            'Sets the content type for every card in this row.',
                            'bcew-blocks'
                        ) }
                        value={ normalizedType }
                        options={ [
                            {
                                label: __( 'Icon + Text', 'bcew-blocks' ),
                                value: 'icon-text',
                            },
                            {
                                label: __( 'Image + Text', 'bcew-blocks' ),
                                value: 'media-text',
                            },
                        ] }
                        onChange={ onChangeContentType }
                        __nextHasNoMarginBottom
                    />
                    <RangeControl
                        label={ __( 'Number of cards', 'bcew-blocks' ) }
                        value={ cardCount }
                        onChange={ onChangeCardCount }
                        min={ MIN_CARD_SLOTS }
                        max={ MAX_CARD_SLOTS }
                        __nextHasNoMarginBottom
                    />
                </PanelBody>
                <PanelBody title={ __( 'Content', 'bcew-blocks' ) } initialOpen>
                    <ToggleControl
                        __nextHasNoMarginBottom
                        label={ __( 'Show paragraph', 'bcew-blocks' ) }
                        help={ __(
                            'Show or hide the paragraph in every card in this row.',
                            'bcew-blocks'
                        ) }
                        checked={ false !== showParagraph }
                        onChange={ ( value ) =>
                            setAttributes( { showParagraph: value } )
                        }
                    />
                    <ToggleControl
                        __nextHasNoMarginBottom
                        label={ __( 'Show list', 'bcew-blocks' ) }
                        help={ __(
                            'Show or hide the list in every card in this row.',
                            'bcew-blocks'
                        ) }
                        checked={ false !== showList }
                        onChange={ ( value ) =>
                            setAttributes( { showList: value } )
                        }
                    />
                </PanelBody>
                <PanelBody title={ __( 'Style', 'bcew-blocks' ) } initialOpen>
                    <ToggleControl
                        __nextHasNoMarginBottom
                        label={ __( 'Box shadow', 'bcew-blocks' ) }
                        help={ __(
                            'Adds a drop shadow to every card in this row.',
                            'bcew-blocks'
                        ) }
                        checked={ !! boxShadow }
                        onChange={ ( value ) =>
                            setAttributes( { boxShadow: value } )
                        }
                    />
                </PanelBody>
            </InspectorControls>
            <div { ...innerBlocksProps } />
        </>
    );
};

export default Edit;
