/**
 * WordPress dependencies
 */
import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
    store as blockEditorStore,
} from '@wordpress/block-editor';
import { createBlock, getBlockType } from '@wordpress/blocks';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

const MENU_QUERY = { per_page: -1, status: [ 'publish', 'draft' ] };
const BCEW_NAVIGATION = 'design-system-wordpress-plugin/navigation';
const CORE_NAVIGATION = 'core/navigation';
const SEARCH_BAR = 'wordpress-search/search-bar';
const BREADCRUMB = 'design-system-wordpress-plugin/breadcrumb';
const MOBILE_BREAKPOINT = 600;

/**
 * One inner block: its name, settings, and any blocks inside it.
 *
 * @param {string} name        Registered block name.
 * @param {Object} attributes  Block settings.
 * @param {Array}  innerBlocks Nested blocks.
 * @return {Array} Inner-block entry.
 */
const innerBlock = ( name, attributes = {}, innerBlocks = [] ) => [
    name,
    attributes,
    innerBlocks,
];

/**
 * Blocks a new header starts with.
 *
 * WordPress uses this list only while the header is still empty. Once the
 * header is saved, the editor shows those saved blocks and does not build
 * this list again. A plugin turned on later does not swap the blocks already
 * in the page.
 *
 * Search, the menus, and the breadcrumb use the design-system blocks when
 * those plugins are on, and the core blocks when they are off. The
 * design-system menu is either the mobile menu or the desktop menu, so the
 * header holds one of each. The stylesheet hides the desktop menu at 600px
 * and below, and the mobile menu from 601px up.
 *
 * @return {Array} Inner-block template.
 */
const headerTemplate = () => {
    /*
     * getBlockType is false when that plugin's block is not registered.
     * The core search block is the stand-in, with its label hidden so the
     * row stays one line.
     */
    const search = getBlockType( SEARCH_BAR )
        ? innerBlock( SEARCH_BAR, {
              className: 'bcew-blocks-header__search',
          } )
        : innerBlock( 'core/search', {
              className: 'bcew-blocks-header__search',
              label: __( 'Search', 'bcew-blocks' ),
              showLabel: false,
              buttonText: __( 'Search', 'bcew-blocks' ),
          } );

    /*
     * The mobile menu is the overlay button. The desktop menu is the link
     * list. Passing 600 matches the stylesheet, because the design-system
     * menu would otherwise switch at 768.
     */
    const mobileMenu = getBlockType( BCEW_NAVIGATION )
        ? innerBlock( BCEW_NAVIGATION, {
              className: 'bcew-blocks-header__mobile-menu',
              overlayMenu: 'always',
              mobileBreakpoint: MOBILE_BREAKPOINT,
              showInDesktop: false,
              showInMobile: true,
          } )
        : innerBlock( CORE_NAVIGATION, {
              className: 'bcew-blocks-header__mobile-menu',
              overlayMenu: 'always',
          } );

    const desktopMenu = getBlockType( BCEW_NAVIGATION )
        ? innerBlock( BCEW_NAVIGATION, {
              className: 'bcew-blocks-header__desktop-menu',
              mobileBreakpoint: MOBILE_BREAKPOINT,
              showInDesktop: true,
              showInMobile: false,
          } )
        : innerBlock( CORE_NAVIGATION, {
              className: 'bcew-blocks-header__desktop-menu',
              overlayMenu: 'never',
          } );

    /*
     * The logo row is a group so the logo, the mobile menu, and the search
     * sit on one line, in that order. That is the order of the theme header.
     * layout "default" keeps WordPress from constraining that row a second
     * time. The desktop menu is its own block so its rules sit on the menu,
     * not on a wrapper.
     */
    const blocks = [
        innerBlock(
            'core/group',
            {
                className: 'bcew-blocks-header__logo-row',
                layout: { type: 'default' },
            },
            [ innerBlock( 'core/site-logo' ), mobileMenu, search ]
        ),
        desktopMenu,
    ];

    /*
     * The breadcrumb block hides itself on the home page. Skip it entirely
     * when that plugin is off, so the header does not save an unknown block.
     */
    if ( getBlockType( BREADCRUMB ) ) {
        blocks.push(
            innerBlock(
                'core/group',
                {
                    className: 'bcew-blocks-header__breadcrumb',
                    layout: { type: 'default' },
                },
                [ innerBlock( BREADCRUMB ) ]
            )
        );
    }

    return blocks;
};

/**
 * Menu id stored on a navigation block.
 *
 * The dropdown reads this instead of keeping its own copy. The core menu
 * stores the id in ref. The design-system menu accepts ref, and older copies
 * of it stored the same id in menuId.
 *
 * @param {Array} blocks Inner blocks.
 * @return {number} Navigation post ID, or 0.
 */
const menuIdFromBlocks = ( blocks ) => {
    for ( const block of blocks ) {
        const isNavigation =
            BCEW_NAVIGATION === block.name || CORE_NAVIGATION === block.name;

        if ( isNavigation ) {
            return block.attributes.ref || block.attributes.menuId || 0;
        }

        /*
         * The menus sit inside the logo row, so keep looking through nested
         * blocks until the first menu id turns up.
         */
        if ( block.innerBlocks?.length ) {
            const nested = menuIdFromBlocks( block.innerBlocks );
            if ( nested ) {
                return nested;
            }
        }
    }

    return 0;
};

/**
 * Search block for the plugins that are on right now.
 *
 * @return {string} Search block name.
 */
const searchBlockName = () =>
    getBlockType( SEARCH_BAR ) ? SEARCH_BAR : 'core/search';

/**
 * Settings for the search block. The core search needs a label or it
 * shows the word Search above the field and the row wraps.
 *
 * @param {string} name Search block name.
 * @return {Object} Block settings.
 */
const searchBlockAttributes = ( name ) => {
    const attributes = { className: 'bcew-blocks-header__search' };

    if ( 'core/search' === name ) {
        attributes.label = __( 'Search', 'bcew-blocks' );
        attributes.showLabel = false;
        attributes.buttonText = __( 'Search', 'bcew-blocks' );
    }

    return attributes;
};

/**
 * A fresh search block for the plugins that are on right now.
 *
 * @return {Object} Search block.
 */
const createSearchBlock = () => {
    const name = searchBlockName();
    return createBlock( name, searchBlockAttributes( name ) );
};

/**
 * The logo row is the group that holds the logo, the mobile menu, and the search.
 *
 * @param {Object} block Inner block.
 * @return {boolean} Whether this block is the logo row.
 */
const isLogoRow = ( block ) =>
    'core/group' === block.name &&
    ( block.attributes?.className || '' ).includes(
        'bcew-blocks-header__logo-row'
    );

/**
 * Whether this block is the header search.
 *
 * @param {Object} block Inner block.
 * @return {boolean} Whether this block is the search.
 */
const isHeaderSearchBlock = ( block ) =>
    SEARCH_BAR === block.name || 'core/search' === block.name;

/**
 * Logo row with the search on or off, in the theme's order.
 *
 * The theme row is the logo, then the mobile menu, then the search. Turning
 * the search off removes it from the saved header. Turning it back on adds
 * a new search at the end of the row. Returns null when the row already
 * matches, so the editor is not marked unsaved for no change.
 *
 * @param {Array}   children   Blocks inside the logo row.
 * @param {boolean} showSearch Whether the search should be in the row.
 * @return {Array|null} Next blocks, or null when unchanged.
 */
const nextLogoRowBlocks = ( children, showSearch ) => {
    const logo = [];
    const middle = [];
    const search = [];

    children.forEach( ( block ) => {
        if ( 'core/site-logo' === block.name ) {
            logo.push( block );
        } else if ( isHeaderSearchBlock( block ) ) {
            search.push( block );
        } else {
            middle.push( block );
        }
    } );

    const next = [ ...logo, ...middle ];

    if ( showSearch ) {
        next.push( ...( search.length ? search : [ createSearchBlock() ] ) );
    }

    const unchanged =
        next.length === children.length &&
        next.every( ( block, index ) => block === children[ index ] );

    return unchanged ? null : next;
};

/**
 * Writes the chosen menu onto every navigation block in the header.
 *
 * Called only when the dropdown changes. The header does not watch the
 * blocks and write the menu again on its own. The design-system menu is
 * given both ref and menuId because its editor reads either one. The core
 * menu only has ref. An unknown menuId on that block would be saved and
 * then rejected.
 *
 * @param {Array}    blocks Inner blocks.
 * @param {number}   menuId Navigation post ID, or 0 when cleared.
 * @param {Function} update Updates a block's attributes.
 */
const applyMenu = ( blocks, menuId, update ) => {
    const ref = menuId || undefined;

    blocks.forEach( ( block ) => {
        if ( BCEW_NAVIGATION === block.name ) {
            if (
                block.attributes.ref !== ref ||
                block.attributes.menuId !== ref
            ) {
                update( block.clientId, { ref, menuId: ref } );
            }
        } else if (
            CORE_NAVIGATION === block.name &&
            block.attributes.ref !== ref
        ) {
            update( block.clientId, { ref } );
        }

        if ( block.innerBlocks?.length ) {
            applyMenu( block.innerBlocks, menuId, update );
        }
    } );
};

/**
 * Header editor. Alignment and colour come from the block toolbar.
 * One menu setting is shared by the mobile menu and the desktop menu.
 *
 * @param {Object}   props               Block props.
 * @param {string}   props.clientId      Block client ID.
 * @param {Object}   props.attributes    Saved settings.
 * @param {Function} props.setAttributes Updates saved settings.
 * @return {import('react').ReactElement} Editor element.
 */
const Edit = ( { clientId, attributes, setAttributes } ) => {
    const showSearch = false !== attributes.showSearch;
    /*
     * Build the starting blocks once. A new array each render would hand
     * the editor a new template, and WordPress would treat the header as
     * needing its inner blocks replaced.
     */
    const template = useMemo( () => headerTemplate(), [] );
    const blockProps = useBlockProps();
    const innerBlocksProps = useInnerBlocksProps( blockProps, {
        template,
        templateLock: 'all',
    } );
    const { updateBlockAttributes, replaceInnerBlocks } =
        useDispatch( blockEditorStore );

    /*
     * The menu list is the one WordPress already stores for navigation
     * blocks. The selected value is whatever menu id those blocks currently
     * hold, so the dropdown stays in step with them.
     */
    const { menus, menuId, innerBlocks } = useSelect(
        ( selectStore ) => {
            const blocks =
                selectStore( blockEditorStore ).getBlocks( clientId );

            return {
                menus: selectStore( coreStore ).getEntityRecords(
                    'postType',
                    'wp_navigation',
                    MENU_QUERY
                ),
                menuId: menuIdFromBlocks( blocks ),
                innerBlocks: blocks,
            };
        },
        [ clientId ]
    );

    /*
     * Keep the logo row in the theme's order, and drop the search when the
     * switch is off. Wait until the logo is present so this does not run
     * while WordPress is still inserting the starting blocks.
     */
    useEffect( () => {
        const logoRow = innerBlocks.find( ( block ) => isLogoRow( block ) );

        if (
            ! logoRow?.innerBlocks?.some(
                ( block ) => 'core/site-logo' === block.name
            )
        ) {
            return;
        }

        const next = nextLogoRowBlocks( logoRow.innerBlocks, showSearch );

        if ( next ) {
            replaceInnerBlocks( logoRow.clientId, next, false );
        }
    }, [ showSearch, innerBlocks, replaceInnerBlocks ] );

    const menuOptions = [
        { label: __( 'Select a menu', 'bcew-blocks' ), value: 0 },
        ...( menus || [] ).map( ( menu ) => ( {
            label:
                menu.title?.raw ||
                menu.title?.rendered ||
                __( '(no title)', 'bcew-blocks' ),
            value: menu.id,
        } ) ),
    ];

    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Menu', 'bcew-blocks' ) }>
                    <SelectControl
                        label={ __( 'Menu', 'bcew-blocks' ) }
                        value={ menuId || 0 }
                        options={ menuOptions }
                        onChange={ ( value ) => {
                            applyMenu(
                                select( blockEditorStore ).getBlocks(
                                    clientId
                                ),
                                parseInt( value, 10 ),
                                updateBlockAttributes
                            );
                        } }
                    />
                </PanelBody>
                <PanelBody title={ __( 'Search', 'bcew-blocks' ) }>
                    <ToggleControl
                        __nextHasNoMarginBottom
                        label={ __( 'Show search', 'bcew-blocks' ) }
                        checked={ showSearch }
                        onChange={ ( value ) =>
                            setAttributes( { showSearch: value } )
                        }
                    />
                </PanelBody>
            </InspectorControls>
            <header { ...innerBlocksProps } />
        </>
    );
};

/**
 * The core search editor shows the words "Optional placeholder". The public
 * page shows the search form. Draw that form in the header.
 *
 * @return {import('react').ReactElement} Editor element.
 */
const HeaderSearchPreview = () => {
    const blockProps = useBlockProps();
    const name = searchBlockName();

    return (
        <div { ...blockProps }>
            <ServerSideRender
                block={ name }
                attributes={ searchBlockAttributes( name ) }
                httpMethod="POST"
            />
        </div>
    );
};

addFilter(
    'editor.BlockEdit',
    'bcew-blocks/header-search',
    ( BlockEdit ) => ( props ) => {
        const className = props.attributes?.className || '';
        const isHeaderSearch =
            ( 'core/search' === props.name || SEARCH_BAR === props.name ) &&
            className.includes( 'bcew-blocks-header__search' );

        if ( ! isHeaderSearch ) {
            return <BlockEdit { ...props } />;
        }

        return <HeaderSearchPreview { ...props } />;
    }
);

export default Edit;
