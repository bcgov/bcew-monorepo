const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test( 'post can be created and published', async ( {
    admin,
    editor,
    page,
} ) => {
    await admin.createNewPost();
    await editor.insertBlock( { name: 'core/paragraph', attributes: { content: 'Hello, World!' } } );

    const postId = await editor.publishPost();
    expect( postId ).not.toBeNull();
} );
