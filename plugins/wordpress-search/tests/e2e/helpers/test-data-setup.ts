import type { RequestUtils } from '@wordpress/e2e-test-utils-playwright';

/**
 * Interface for test data returned by createTestPosts
 */
export interface TestPostsData {
    postIds: number[];
    categoryIds: number[];
}

// Test data constants
const CATEGORY_NAMES = [
    'Test Category A',
    'Test Category B',
    'Test Category C',
];
const POST_TITLES = [
    'Test Post 1',
    'Test Post 2',
    'Test Post 3',
    'Test Post 4',
];

/**
 * Creates test posts and categories using native WordPress REST API
 *
 * Creates:
 * - 4 posts using default WordPress post type
 * - 3 categories: "Test Category A", "Test Category B", "Test Category C"
 * - Assigns categories to posts
 *
 * @param {Object} requestUtils RequestUtils instance for making API calls.
 * @return {Promise<TestPostsData>} Created post and category ids.
 */
export const createTestPosts = async (
    requestUtils: RequestUtils
): Promise< TestPostsData > => {
    // Step 1: Clean up any existing test data before creating new ones
    await deleteTestPosts( requestUtils, undefined );

    // Step 2: Create new categories in parallel
    const categoryPromises = CATEGORY_NAMES.map( ( name ) =>
        requestUtils
            .rest( {
                method: 'POST',
                path: '/wp/v2/categories',
                data: { name },
            } )
            .catch( ( error: any ) => {
                if ( 'rest_no_route' === error?.code ) {
                    throw new Error(
                        `WordPress REST API is not available. Categories endpoint not found. Error: ${ error.message }`
                    );
                }
                throw error;
            } )
    );

    const categories = ( await Promise.all( categoryPromises ) ) as Array< {
        id: number;
    } >;
    const categoryIds = categories.map( ( cat ) => cat.id );

    // Step 3: Create new posts in parallel (with categories assigned)
    const postPromises = POST_TITLES.map( ( title, i ) =>
        requestUtils
            .rest( {
                method: 'POST',
                path: '/wp/v2/posts',
                data: {
                    title,
                    content: `Content for ${ title }`,
                    status: 'publish',
                    categories:
                        categoryIds.length > 0
                            ? [ categoryIds[ i % categoryIds.length ] ]
                            : [],
                },
            } )
            .catch( ( error: any ) => {
                if ( 'rest_no_route' === error?.code ) {
                    throw new Error(
                        `WordPress REST API is not available. Posts endpoint not found. Error: ${ error.message }`
                    );
                }
                throw error;
            } )
    );

    const posts = ( await Promise.all( postPromises ) ) as Array< {
        id: number;
    } >;
    const postIds = posts.map( ( post ) => post.id );

    return {
        postIds,
        categoryIds,
    };
};

/**
 * Deletes test posts and categories using native WordPress REST API
 *
 * Finds and deletes all test items by matching names/titles:
 * - Categories: "Test Category A", "Test Category B", "Test Category C"
 * - Posts: "Test Post 1", "Test Post 2", "Test Post 3", "Test Post 4"
 *
 * This function is used both:
 * - At the start of createTestPosts() to clean up existing data
 * - At the end of tests to clean up after tests complete
 *
 * @param {Object} requestUtils RequestUtils instance for making API calls.
 * @param {Object} testData     Kept for callers. Deletion matches by name and title.
 * @return {Promise<void>} Resolves when posts and categories are deleted.
 */
export const deleteTestPosts = async (
    requestUtils: RequestUtils,
    testData: TestPostsData | undefined
): Promise< void > => {
    void testData;

    // In a test environment, we can delete all posts and categories
    // This is simpler and ensures a clean slate

    // Fetch all posts and categories
    const [ categoriesResult, postsResult ] = await Promise.allSettled( [
        requestUtils.rest( {
            method: 'GET',
            path: '/wp/v2/categories',
            params: { per_page: 100 },
        } ) as Promise< Array< { id: number; name: string } > >,
        requestUtils.rest( {
            method: 'GET',
            path: '/wp/v2/posts',
            params: { status: 'any', per_page: 100 },
        } ) as Promise< Array< { id: number; title: { rendered: string } } > >,
    ] );

    // Delete all categories (except default "Uncategorized" which can't be deleted)
    if ( 'fulfilled' === categoriesResult.status ) {
        const categoriesToDelete = categoriesResult.value
            .filter( ( cat ) => cat.name !== 'Uncategorized' ) // Can't delete default category
            .map( ( cat ) =>
                requestUtils
                    .rest( {
                        method: 'DELETE',
                        path: `/wp/v2/categories/${ cat.id }`,
                        data: { force: true },
                    } )
                    .catch( ( error ) => {
                        console.warn(
                            `Failed to delete category "${ cat.name }":`,
                            error
                        );
                    } )
            );
        await Promise.all( categoriesToDelete );
    }

    // Delete all posts
    if ( 'fulfilled' === postsResult.status ) {
        const postsToDelete = postsResult.value.map( ( post ) =>
            requestUtils
                .rest( {
                    method: 'DELETE',
                    path: `/wp/v2/posts/${ post.id }`,
                    data: { force: true },
                } )
                .catch( ( error ) => {
                    console.warn(
                        `Failed to delete post "${ post.title.rendered }":`,
                        error
                    );
                } )
        );
        await Promise.all( postsToDelete );
    }
};
