import { Tree } from '@nx/devkit';

/**
 * Base interface for WordPress plugins/themes/blocks.
 */
export interface WordPressGeneratorSchema {
    name: string;
    slug: string;
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
 * @param {Tree}                     tree   Filesystem tree.
 * @param {WordPressGeneratorSchema} schema Options from schema.json.
 * @param {WordPressProjectType}     type   WordPress project type.
 */
export const updateLabeler = async (
    tree: Tree,
    schema: WordPressGeneratorSchema,
    type: WordPressProjectType = WordPressProjectType.Theme
) => {
    const filePath = `.github/labeler.yml`;
    const contents = tree.read( filePath ).toString();
    const pathPrefix =
        type === WordPressProjectType.Theme ? 'themes' : 'plugins';
    const newContents = contents.concat(
        `
${ pathPrefix }/${ schema.slug }:
    - changed-files:
        - any-glob-to-any-file: '${ pathPrefix }/${ schema.slug }/**'

        `
    );
    tree.write( filePath, newContents );
};
