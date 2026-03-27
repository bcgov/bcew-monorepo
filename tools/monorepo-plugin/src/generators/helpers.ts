import { Tree } from '@nx/devkit';

/**
 * Base interface for WordPress plugins/themes/blocks.
 */
export interface WordPressGeneratorSchema {
    name: string;
    wpEnvPort: number;
}

/**
 * Enum for types of WordPress projects.
 */
export enum WordPressProjectType {
    Theme,
    Plugin,
}

/**
 * Updates .github/labeler.yml with the new project.
 * @param {Tree}                 tree Filesystem tree.
 * @param {string}               slug Hyphen-separated project slug.
 * @param {WordPressProjectType} type WordPress project type.
 */
export const updateLabeler = async (
    tree: Tree,
    slug: string,
    type: WordPressProjectType = WordPressProjectType.Theme
) => {
    const filePath = `.github/labeler.yml`;
    const contents = tree.read( filePath );
    if ( ! contents ) {
        return;
    }
    const pathPrefix =
        type === WordPressProjectType.Theme ? 'themes' : 'plugins';
    const newContents = contents.toString().concat(
        `
${ pathPrefix }/${ slug }:
    - changed-files:
        - any-glob-to-any-file: '${ pathPrefix }/${ slug }/**'

        `
    );
    tree.write( filePath, newContents );
};
