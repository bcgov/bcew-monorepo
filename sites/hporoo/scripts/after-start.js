#!/usr/bin/env node

const { execSync } = require( 'child_process' );

// Function to execute wp command
/**
 * Run a WP-CLI command inside the wp-env CLI container.
 *
 * @param {string} command WP-CLI arguments to run.
 * @return {string} Standard output from the WP-CLI command.
 */
const wp = ( command ) => {
    return execSync( `npx wp-env run cli wp ${ command }`, {
        encoding: 'utf8',
    } );
};

// Escape a value for safe inclusion inside a double-quoted shell argument.
/**
 * Escape a string for safe use inside a double-quoted shell argument.
 *
 * @param {string} value Raw string value to escape.
 * @return {string} Escaped string value.
 */
const escapeForDoubleQuotedShellArg = ( value ) => {
    return value.replace( /\\/g, '\\\\' ).replace( /"/g, '\\"' );
};

// Activate the child theme so the local environment matches the theme's development environment.
const THEME_SLUG = 'design-system-wordpress-child-theme-hporoo';
wp( `theme activate "${ THEME_SLUG }"` );

// Use pretty permalinks so local links match how the theme is built.
wp( 'option update permalink_structure "/%postname%/"' );
wp( 'rewrite flush --hard >/dev/null' );

// Set up the Home and Posts pages for local development.
const HOME_PAGE_TITLE = 'Home';
const HOME_PAGE_SLUG = 'home';
const POSTS_PAGE_TITLE = 'News';
const POSTS_PAGE_SLUG = 'news';

const PAGE_CONTENT = `<!-- wp:paragraph -->
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<!-- /wp:paragraph -->`;

const HOME_PAGE_CONTENT = PAGE_CONTENT;

let homePageId = wp(
    `post list --post_type=page --name="${ HOME_PAGE_SLUG }" --post_status=publish,draft,pending,future,private --field=ID --format=ids`
).trim();
if ( ! homePageId ) {
    homePageId = wp(
        `post create --post_type=page --post_title="${ HOME_PAGE_TITLE }" --post_name="${ HOME_PAGE_SLUG }" --post_status=publish --post_content="${ escapeForDoubleQuotedShellArg(
            HOME_PAGE_CONTENT
        ) }" --porcelain`
    ).trim();
} else {
    wp(
        `post update ${ homePageId } --post_status=publish --post_content="${ escapeForDoubleQuotedShellArg(
            HOME_PAGE_CONTENT
        ) }"`
    );
}

let postsPageId = wp(
    `post list --post_type=page --name="${ POSTS_PAGE_SLUG }" --post_status=publish,draft,pending,future,private --field=ID --format=ids`
).trim();
if ( ! postsPageId ) {
    postsPageId = wp(
        `post create --post_type=page --post_title="${ POSTS_PAGE_TITLE }" --post_name="${ POSTS_PAGE_SLUG }" --post_status=publish --porcelain`
    ).trim();
} else {
    wp( `post update ${ postsPageId } --post_status=publish` );
}

// Keep a stable secondary page for local navigation and manual testing.
let samplePageId = wp(
    `post list --post_type=page --name=sample-page --post_status=publish,draft,pending,future,private --field=ID --format=ids`
).trim();
if ( ! samplePageId ) {
    samplePageId = wp(
        `post create --post_type=page --post_title="Sample Page" --post_name="sample-page" --post_status=publish --porcelain`
    ).trim();
}

// Create About Us page
const aboutUsContent = PAGE_CONTENT;

let aboutUsPageId = wp(
    `post list --post_type=page --name=about-us --post_status=publish,draft,pending,future,private --field=ID --format=ids`
).trim();
if ( ! aboutUsPageId ) {
    aboutUsPageId = wp(
        `post create --post_type=page --post_title="About Us" --post_name=about-us --post_status=publish --post_content="${ escapeForDoubleQuotedShellArg(
            aboutUsContent
        ) }" --porcelain`
    ).trim();
} else {
    wp(
        `post update ${ aboutUsPageId } --post_status=publish --post_content="${ escapeForDoubleQuotedShellArg(
            aboutUsContent
        ) }"`
    );
}

// Create Contact Us page
const contactUsContent = PAGE_CONTENT;

let contactUsPageId = wp(
    `post list --post_type=page --name=contact-us --post_status=publish,draft,pending,future,private --field=ID --format=ids`
).trim();
if ( ! contactUsPageId ) {
    contactUsPageId = wp(
        `post create --post_type=page --post_title="Contact Us" --post_name=contact-us --post_status=publish --post_content="${ escapeForDoubleQuotedShellArg(
            contactUsContent
        ) }" --porcelain`
    ).trim();
} else {
    wp(
        `post update ${ contactUsPageId } --post_status=publish --post_content="${ escapeForDoubleQuotedShellArg(
            contactUsContent
        ) }"`
    );
}

// Create a blog post
const postContent = PAGE_CONTENT;

let postId = wp(
    `post list --post_type=post --name=hello-world --post_status=publish,draft,pending,future,private --field=ID --format=ids`
).trim();
if ( ! postId ) {
    postId = wp(
        `post create --post_type=post --post_title="Hello World" --post_name=hello-world --post_status=publish --post_content="${ escapeForDoubleQuotedShellArg(
            postContent
        ) }" --porcelain`
    ).trim();
} else {
    wp(
        `post update ${ postId } --post_status=publish --post_content="${ escapeForDoubleQuotedShellArg(
            postContent
        ) }"`
    );
}

// Set the front page to the Home page.
wp( 'option update show_on_front page' );
wp( `option update page_on_front ${ homePageId }` );

// Set General settings
wp( 'option update blogdescription "Government of British Columbia"' );
wp( 'option update timezone_string "America/Vancouver"' );

// Set Reading settings
wp( 'option update posts_per_page 10' );
wp( `option update page_for_posts ${ postsPageId }` );
wp( 'option update show_on_front page' );
wp( `option update page_on_front ${ homePageId }` );
wp( 'option update blog_public 0' );

// Seed the navigation post referenced by the header template.
// This script is intended to be run in the local environment after the container is up and running. It should be used to perform any necessary setup or configuration that requires the WordPress environment to be active, such as activating the theme, setting up pages, and seeding navigation.
const PRIMARY_NAV_ID = 1302;
wp(
    `eval '$nav_id = ${ PRIMARY_NAV_ID }; $sample_page_id = ${ samplePageId };'`
);

console.log( `Local bootstrap complete for ${ THEME_SLUG }` );
