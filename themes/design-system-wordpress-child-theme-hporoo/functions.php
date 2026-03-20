<?php
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'child-style',
        get_stylesheet_uri(),
        [],
        wp_get_theme()->get('Version')
    );
});

// Enqueue the same styles for the block editor
add_action('enqueue_block_editor_assets', function () {
    wp_enqueue_style(
        'child-editor-style',
        get_stylesheet_directory_uri() . '/style.css',
        array(),
        wp_get_theme()->get('Version')
    );
});