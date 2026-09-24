/**
 * Breadcrumb Block Frontend JavaScript
 *
 * Handles desktop-only left/right arrow buttons to scroll the breadcrumb
 * when content overflows. Arrows are shown/hidden via CSS (desktop only).
 *
 * @since 1.0.0
 */

document.addEventListener( 'DOMContentLoaded', () => {
    const blocks = document.querySelectorAll(
        '.wp-block-design-system-wordpress-plugin-breadcrumb'
    );

    blocks.forEach( ( block ) => {
        const container = block.querySelector(
            '.dswp-block-breadcrumb__container'
        );
        const leftArrow = block.querySelector( '.dswp-breadcrumb-arrow--left' );
        const rightArrow = block.querySelector(
            '.dswp-breadcrumb-arrow--right'
        );

        if ( ! container || ! leftArrow || ! rightArrow ) {
            return;
        }

        const scrollAmount = 200;

        /**
         * Updates breadcrumb scroll arrow visibility.
         */
        const updateArrowVisibility = () => {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            const canScrollLeft = scrollLeft > 0;
            const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;

            leftArrow.classList.toggle( 'is-hidden', ! canScrollLeft );
            rightArrow.classList.toggle( 'is-hidden', ! canScrollRight );
            leftArrow.setAttribute( 'aria-hidden', ! canScrollLeft );
            rightArrow.setAttribute( 'aria-hidden', ! canScrollRight );
        };

        leftArrow.addEventListener( 'click', () => {
            container.scrollBy( { left: -scrollAmount, behavior: 'smooth' } );
        } );

        rightArrow.addEventListener( 'click', () => {
            container.scrollBy( { left: scrollAmount, behavior: 'smooth' } );
        } );

        container.addEventListener( 'scroll', updateArrowVisibility );

        // Initial state and on resize (overflow may change)
        if ( 'undefined' !== typeof window.ResizeObserver ) {
            const resizeObserver = new window.ResizeObserver(
                updateArrowVisibility
            );
            resizeObserver.observe( container );
        }

        updateArrowVisibility();
    } );
} );
