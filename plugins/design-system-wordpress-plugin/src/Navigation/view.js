/**
 * Navigation Block Frontend JavaScript
 *
 * Handles the interactive functionality of the navigation block including:
 * - Mobile menu toggling
 * - Submenu handling
 * - Responsive behavior
 * - Keyboard navigation
 * - Position adjustments for nested menus
 *
 * @since 1.0.0
 */

document.addEventListener( 'DOMContentLoaded', () => {
    // Select all navigation blocks that can have overlay behavior
    const navBlocks = document.querySelectorAll(
        '.dswp-block-navigation-is-mobile-overlay, ' +
            '.dswp-block-navigation-is-always-overlay, ' +
            '.dswp-block-navigation-is-never-overlay'
    );

    navBlocks.forEach( ( nav ) => {
        // Cache frequently used DOM elements
        const elements = {
            mobileNavIcon: nav.querySelector( '.dswp-nav-mobile-toggle-icon' ),
            menuContainer: nav.querySelector(
                '.dswp-block-navigation__container'
            ),
            iconText: nav.querySelector( '.dswp-nav-mobile-menu-icon-text' ),
            topBar: nav.querySelector( '.dswp-nav-mobile-menu-top-bar' ),
            middleBar: nav.querySelector( '.dswp-nav-mobile-menu-middle-bar' ),
            bottomBar: nav.querySelector( '.dswp-nav-mobile-menu-bottom-bar' ),
        };

        // Initialize state flags
        const isMobileMode = nav.classList.contains(
            'dswp-block-navigation-is-mobile-overlay'
        );
        const isAlwaysMode = nav.classList.contains(
            'dswp-block-navigation-is-always-overlay'
        );

        // Check if showInDesktop is enabled
        const showInDesktop = 'true' === nav.dataset.showInDesktop;

        // Check if showInMobile is enabled
        const showInMobile = 'true' === nav.dataset.showInMobile;

        /**
         * Closes all open submenus within the navigation
         */
        const closeAllSubmenus = () => {
            const openSubmenus = nav.querySelectorAll(
                '.wp-block-navigation-submenu.is-open'
            );
            openSubmenus.forEach( ( submenu ) => {
                submenu.classList.remove( 'is-open' );
                const submenuContainer = submenu.querySelector(
                    '.wp-block-navigation__submenu-container'
                );
                const submenuButton = submenu.querySelector(
                    '.dswp-submenu-toggle'
                );
                if ( submenuContainer ) {
                    submenuContainer.classList.remove( 'is-open' );
                }
                if ( submenuButton ) {
                    submenuButton.setAttribute( 'aria-expanded', 'false' );
                }
            } );
        };

        /**
         * Resets the mobile menu to its default state
         */
        const resetMenuState = () => {
            if ( elements.iconText ) {
                elements.iconText.innerText = 'Menu';
            }
            if ( elements.topBar ) {
                elements.topBar.classList.remove(
                    'dswp-nav-mobile-menu-top-bar-open'
                );
            }
            if ( elements.middleBar ) {
                elements.middleBar.classList.remove(
                    'dswp-nav-mobile-menu-middle-bar-open'
                );
            }
            if ( elements.bottomBar ) {
                elements.bottomBar.classList.remove(
                    'dswp-nav-mobile-menu-bottom-bar-open'
                );
            }
            elements.mobileNavIcon.setAttribute( 'aria-expanded', 'false' );
        };

        /**
         * Resets all submenu arrow rotations to their default state
         */
        const resetArrowRotations = () => {
            const allArrows = nav.querySelectorAll( '.dswp-submenu-toggle' );
            allArrows.forEach( ( arrow ) => {
                arrow.setAttribute( 'aria-expanded', 'false' );
            } );
        };

        /**
         * Event Handlers
         */

        /**
         * Handles responsive behavior when window is resized
         */
        const handleResize = () => {
            const mobileBreakpoint =
                parseInt( nav.dataset.dswpMobileBreakpoint ) || 768;
            const isMobileView = window.innerWidth <= mobileBreakpoint;

            if ( isMobileView ) {
                elements.mobileNavIcon.style.display = 'flex';
                elements.menuContainer.style.display = 'none';
                elements.menuContainer.classList.add( 'dswp-is-mobile' );
                nav.classList.add( 'dswp-block-navigation-is-mobile-overlay' );
            } else {
                elements.mobileNavIcon.style.display = 'none';
                elements.menuContainer.style.display = 'flex';
                elements.menuContainer.classList.remove(
                    'dswp-is-mobile',
                    'is-menu-open'
                );
                nav.classList.remove(
                    'dswp-block-navigation-is-mobile-overlay'
                );
                resetMenuState();
                closeAllSubmenus();
            }
        };

        /**
         * Position & Layout Functions
         */

        /**
         * Adjusts the position of submenus to ensure they remain visible within viewport
         * @param {HTMLElement} submenu - The submenu element to position
         */
        const adjustSubmenuPosition = ( submenu ) => {
            const submenuContainer = submenu.querySelector(
                '.wp-block-navigation__submenu-container'
            );
            if ( ! submenuContainer ) {
                return;
            }

            const level = getSubmenuLevel( submenu );

            // Reset position first
            if ( 1 === level ) {
                submenuContainer.style.left = '0%';
                submenuContainer.style.right = 'auto';
            } else if ( level >= 2 ) {
                submenuContainer.style.left = '100%';
                submenuContainer.style.right = 'auto';
            }

            // Check viewport boundaries
            const rect = submenuContainer.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            if ( 1 === level && rect.right > viewportWidth ) {
                submenuContainer.style.left = 'auto';
                submenuContainer.style.right = '0%';
            } else if ( level >= 2 && rect.right > viewportWidth ) {
                submenuContainer.style.left = 'auto';
                submenuContainer.style.right = '100%';
            }
        };

        /**
         * Determines the nesting level of a submenu
         * @param {HTMLElement} submenu - The submenu element to check
         * @return {number} The nesting level (1-based)
         */
        const getSubmenuLevel = ( submenu ) => {
            let level = 1;
            let parent = submenu.parentElement;
            while ( parent ) {
                if (
                    parent.classList.contains( 'wp-block-navigation-submenu' )
                ) {
                    level++;
                }
                parent = parent.parentElement;
            }
            return level;
        };

        /**
         * Determines the nesting level of a submenu and adds appropriate classes
         * @param {HTMLElement} submenu - The submenu element to check
         * @return {number} The nesting level (1-based)
         */
        const initializeSubmenuLevel = ( submenu ) => {
            let level = 1;
            let parent = submenu.parentElement;
            while ( parent ) {
                if (
                    parent.classList.contains( 'wp-block-navigation-submenu' )
                ) {
                    level++;
                }
                parent = parent.parentElement;
            }
            return level;
        };

        /**
         * Initialization
         */

        // Set initial states
        if (
            isAlwaysMode ||
            nav.classList.contains( 'dswp-block-navigation-is-mobile-only' )
        ) {
            elements.mobileNavIcon.style.display = 'flex';
            elements.menuContainer.style.display = 'none';
            elements.menuContainer.classList.add( 'dswp-is-mobile' );
        } else if ( isMobileMode ) {
            handleResize();
        }

        // Event Listeners
        if ( isMobileMode ) {
            window.addEventListener( 'resize', handleResize );
        }

        // Mobile menu toggle functionality
        if ( elements.mobileNavIcon ) {
            elements.mobileNavIcon.addEventListener( 'click', () => {
                elements.menuContainer.classList.toggle( 'is-menu-open' );
                const isOpen =
                    elements.menuContainer.classList.contains( 'is-menu-open' );

                elements.mobileNavIcon.setAttribute(
                    'aria-expanded',
                    isOpen.toString()
                );

                // Toggle hamburger animation
                elements.topBar.classList.toggle(
                    'dswp-nav-mobile-menu-top-bar-open'
                );
                elements.middleBar.classList.toggle(
                    'dswp-nav-mobile-menu-middle-bar-open'
                );
                if ( elements.bottomBar ) {
                    elements.bottomBar.classList.toggle(
                        'dswp-nav-mobile-menu-bottom-bar-open'
                    );
                }

                elements.iconText.innerText = isOpen ? 'Close menu' : 'Menu';
                elements.menuContainer.style.display = isOpen ? 'grid' : 'none';

                if ( ! isOpen ) {
                    closeAllSubmenus();
                }
            } );
        }

        // Close menu when clicking outside
        document.addEventListener( 'click', ( event ) => {
            const isClickInside = nav.contains( event.target );
            const isMobileView =
                window.innerWidth <=
                ( parseInt( nav.dataset.dswpMobileBreakpoint ) || 768 );

            // Close submenus if click is outside and we're in desktop mode
            if ( ! isClickInside ) {
                if (
                    isMobileView &&
                    elements.menuContainer.classList.contains( 'is-menu-open' )
                ) {
                    // Mobile mode - close everything
                    elements.menuContainer.classList.remove( 'is-menu-open' );
                    elements.menuContainer.style.display = 'none';
                    resetMenuState();
                    closeAllSubmenus();
                } else if ( ! isMobileView ) {
                    // Desktop mode - only close submenus
                    closeAllSubmenus();
                    resetArrowRotations( nav );
                }
            }
        } );

        // Handle escape key
        document.addEventListener( 'keydown', ( event ) => {
            if ( 'Escape' === event.key ) {
                if (
                    elements.menuContainer.classList.contains( 'is-menu-open' )
                ) {
                    elements.menuContainer.classList.remove( 'is-menu-open' );
                    elements.menuContainer.style.display = 'none';
                    resetMenuState();
                }
                closeAllSubmenus();
                resetArrowRotations( nav );
            }
        } );

        // Initialize submenu functionality
        const submenuLinks = nav.querySelectorAll(
            '.wp-block-navigation-submenu > .wp-block-navigation-item__content'
        );
        submenuLinks.forEach( ( link ) => {
            const submenu = link.closest( '.wp-block-navigation-submenu' );
            const hasSubmenu = submenu?.querySelector(
                '.wp-block-navigation__submenu-container'
            );

            if ( hasSubmenu ) {
                // Add level class to submenu
                initializeSubmenuLevel( submenu );

                // Create submenu toggle button
                const arrowButton = document.createElement( 'button' );
                arrowButton.className = 'dswp-submenu-toggle';
                arrowButton.setAttribute( 'aria-expanded', 'false' );
                arrowButton.setAttribute( 'aria-label', 'Toggle submenu' );
                link.parentNode.insertBefore( arrowButton, link.nextSibling );

                // Handle keyboard interaction
                arrowButton.addEventListener( 'keydown', ( e ) => {
                    if ( 'Enter' === e.key || ' ' === e.key ) {
                        e.preventDefault();
                        // Trigger the same behavior as click
                        const isMobile =
                            elements.menuContainer.classList.contains(
                                'dswp-is-mobile'
                            );

                        if ( ! isMobile ) {
                            // Desktop behavior - toggle submenu
                            submenu.classList.toggle( 'is-open' );
                            const submenuContainer = submenu.querySelector(
                                '.wp-block-navigation__submenu-container'
                            );
                            if ( submenuContainer ) {
                                submenuContainer.classList.toggle( 'is-open' );
                                if ( submenu.classList.contains( 'is-open' ) ) {
                                    const level = getSubmenuLevel( submenu );
                                    if ( level >= 2 ) {
                                        adjustSubmenuPosition( submenu );
                                    }
                                }
                            }
                            arrowButton.setAttribute(
                                'aria-expanded',
                                submenu.classList.contains( 'is-open' )
                            );
                        } else {
                            // Mobile behavior - use existing click handler logic
                            arrowButton.click();
                        }
                    }
                } );

                // Handle submenu toggle click (mobile only)
                arrowButton.addEventListener( 'click', () => {
                    if (
                        elements.menuContainer.classList.contains(
                            'dswp-is-mobile'
                        )
                    ) {
                        // Close other submenus
                        const currentPath = [];
                        let parent = submenu;
                        while ( parent ) {
                            if (
                                parent.classList.contains(
                                    'wp-block-navigation-submenu'
                                )
                            ) {
                                currentPath.push( parent );
                            }
                            parent = parent.parentElement.closest(
                                '.wp-block-navigation-submenu'
                            );
                        }

                        nav.querySelectorAll(
                            '.wp-block-navigation-submenu.is-open'
                        ).forEach( ( openSubmenu ) => {
                            if ( ! currentPath.includes( openSubmenu ) ) {
                                openSubmenu.classList.remove( 'is-open' );
                                const container = openSubmenu.querySelector(
                                    '.wp-block-navigation__submenu-container'
                                );
                                const button = openSubmenu.querySelector(
                                    '.dswp-submenu-toggle'
                                );
                                if ( container ) {
                                    container.classList.remove( 'is-open' );
                                }
                                if ( button ) {
                                    button.setAttribute(
                                        'aria-expanded',
                                        'false'
                                    );
                                }
                            }
                        } );

                        // Toggle current submenu
                        submenu.classList.toggle( 'is-open' );
                        if ( submenu.classList.contains( 'is-open' ) ) {
                            arrowButton.setAttribute( 'aria-expanded', 'true' );
                        } else {
                            arrowButton.setAttribute(
                                'aria-expanded',
                                'false'
                            );
                        }
                    }
                } );

                // Add hover functionality for desktop
                if (
                    ! elements.menuContainer.classList.contains(
                        'dswp-is-mobile'
                    )
                ) {
                    submenu.addEventListener( 'mouseenter', () => {
                        if (
                            ! elements.menuContainer.classList.contains(
                                'dswp-is-mobile'
                            )
                        ) {
                            submenu.classList.add( 'is-open' );
                            const submenuContainer = submenu.querySelector(
                                '.wp-block-navigation__submenu-container'
                            );
                            if ( submenuContainer ) {
                                submenuContainer.classList.add( 'is-open' );
                                const level = getSubmenuLevel( submenu );
                                if ( level >= 2 ) {
                                    adjustSubmenuPosition( submenu );
                                }
                            }
                        }
                    } );

                    submenu.addEventListener( 'mouseleave', () => {
                        if (
                            ! elements.menuContainer.classList.contains(
                                'dswp-is-mobile'
                            )
                        ) {
                            submenu.classList.remove( 'is-open' );
                            const submenuContainer = submenu.querySelector(
                                '.wp-block-navigation__submenu-container'
                            );
                            if ( submenuContainer ) {
                                submenuContainer.classList.remove( 'is-open' );
                            }
                        }
                    } );
                }
            }
        } );

        // Add active link highlighting
        const currentUrl = new URL( window.location.href );
        const currentPathname = currentUrl.pathname;
        const currentSearch = currentUrl.search;

        nav.querySelectorAll( '.wp-block-navigation-item__content' ).forEach(
            ( link ) => {
                const linkUrl = new URL( link.href, window.location.origin );
                const linkPathname = linkUrl.pathname;
                const linkSearch = linkUrl.search;

                // Only match if pathnames match
                if ( linkPathname === currentPathname ) {
                    // If the link has query parameters, only match if they match exactly
                    // If the link has no query parameters, only match if current page also has no query parameters
                    // This prevents home link (/) from matching search pages (/?s=...)
                    if ( linkSearch ) {
                        // Link has query params - only match if they match exactly
                        if ( linkSearch === currentSearch ) {
                            link.classList.add( 'active' );
                            const parentItem = link.closest(
                                '.wp-block-navigation-item'
                            );
                            if ( parentItem ) {
                                parentItem.classList.add( 'active' );
                            }
                        }
                    } else if ( ! currentSearch ) {
                        // Link has no query params - only match if current page also has no query params
                        link.classList.add( 'active' );
                        const parentItem = link.closest(
                            '.wp-block-navigation-item'
                        );
                        if ( parentItem ) {
                            parentItem.classList.add( 'active' );
                        }
                    }
                }
            }
        );

        // Adjust display logic based on screen size
        /**
         * Updates desktop and mobile visibility for the navigation block.
         */
        const updateDisplay = () => {
            const mobileBreakpoint =
                parseInt( nav.dataset.dswpMobileBreakpoint ) || 768;
            const isMobileView = window.innerWidth <= mobileBreakpoint;

            // If both visibility options are explicitly set to false, show the menu
            if ( false === showInDesktop && false === showInMobile ) {
                nav.style.display = 'flex';
                return;
            }

            // Otherwise, follow the normal visibility rules
            if ( false === showInDesktop && ! isMobileView ) {
                nav.style.display = 'none';
            } else if ( false === showInMobile && isMobileView ) {
                nav.style.display = 'none';
            } else {
                nav.style.display = 'flex';
            }
        };

        // Initial display update
        updateDisplay();

        // Update display on resize
        window.addEventListener( 'resize', updateDisplay );
    } );
} );
