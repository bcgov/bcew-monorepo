/**
 * WordPress dependencies
 */
import {
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
    store as blockEditorStore,
} from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
import { PanelBody, SelectControl } from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { select, useDispatch, useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
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
     * The logo row is a group so the logo, search, and mobile menu sit on
     * one line. layout "default" keeps WordPress from constraining that row
     * a second time. The desktop menu is its own block so its rules sit on
     * the menu, not on a wrapper.
     */
    const blocks = [
        innerBlock(
            'core/group',
            {
                className: 'bcew-blocks-header__logo-row',
                layout: { type: 'default' },
            },
            [ innerBlock( 'core/site-logo' ), search, mobileMenu ]
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
 * @param {Object} props          Block props.
 * @param {string} props.clientId Block client ID.
 * @return {import('react').ReactElement} Editor element.
 */
const Edit = ( { clientId } ) => {
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
    const { updateBlockAttributes } = useDispatch( blockEditorStore );

    /*
     * The menu list is the one WordPress already stores for navigation
     * blocks. The selected value is whatever menu id those blocks currently
     * hold, so the dropdown stays in step with them.
     */
    const { menus, menuId } = useSelect(
        ( selectStore ) => ( {
            menus: selectStore( coreStore ).getEntityRecords(
                'postType',
                'wp_navigation',
                MENU_QUERY
            ),
            menuId: menuIdFromBlocks(
                selectStore( blockEditorStore ).getBlocks( clientId )
            ),
        } ),
        [ clientId ]
    );

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
