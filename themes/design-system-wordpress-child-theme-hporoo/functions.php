<?php
add_action(
    'wp_enqueue_scripts',
    function () {
            wp_enqueue_style(
                'child-style',
                get_stylesheet_uri(),
                [],
                wp_get_theme()->get( 'Version' )
            );
    }
);

// Load child styles in block editor content.
add_action(
    'after_setup_theme',
    function () {
        add_editor_style( 'style.css' );
    }
);
