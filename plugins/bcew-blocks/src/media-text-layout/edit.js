import {
    useBlockProps,
    InnerBlocks,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
} from '@wordpress/block-editor';
import { BaseControl, PanelBody, ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

const TEMPLATE = [
    [ 'core/heading' ],
    [ 'core/paragraph' ],
    [ 'core/list' ],
    [ 'core/buttons' ],
];

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Persisted attributes.
 * @param {Function} props.setAttributes Updates attributes.
 * @return {Element} Element to render.
 */
const Edit = ( { attributes, setAttributes } ) => {
    const { imagePosition, imageId, layoutRatio, characterLimit } = attributes;
    const media = useSelect(
        ( select ) => {
            if ( ! imageId ) {
                return null;
            }

            return select( coreStore ).getMedia( imageId );
        },
        [ imageId ]
    );
    const styles = {
        '--ratio-image': `${ layoutRatio.image }%`,
        '--ratio-content': `${ layoutRatio.content }%`,
    };
    const blockProps = useBlockProps( {
        className:
            'right' === imagePosition ? 'is-image-right' : 'is-image-left',
        style: styles,
    } );

    return (
        <>
            <InspectorControls>
                <PanelBody title="Layouts" initialOpen={ true }>
                    <ToggleControl
                        label="Image on right"
                        checked={ 'right' === imagePosition }
                        onChange={ ( value ) =>
                            setAttributes( {
                                imagePosition: value ? 'right' : 'left',
                            } )
                        }
                    />
                    <BaseControl
                        id="media-text-layout-ratio"
                        label="Layout Ratio"
                        help="The default image/content split."
                    >
                        <div>
                            { layoutRatio.image } / { layoutRatio.content }
                        </div>
                    </BaseControl>
                    <BaseControl
                        id="media-text-layout-character-limit"
                        label="Character Limit"
                        help="Maximum recommended character length for headings and paragraphs."
                    >
                        <div>{ characterLimit }</div>
                    </BaseControl>
                </PanelBody>
            </InspectorControls>

            <div { ...blockProps }>
                <div className="layout-shell">
                    <div className="wp-block-image">
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={ ( selectedMedia ) =>
                                    setAttributes( {
                                        imageId: selectedMedia?.id,
                                    } )
                                }
                                allowedTypes={ [ 'image' ] }
                                value={ imageId }
                                render={ ( { open } ) => (
                                    <div
                                        className="image-inner"
                                        role="button"
                                        tabIndex={ 0 }
                                        aria-label={
                                            media
                                                ? 'Replace image'
                                                : 'Select image'
                                        }
                                        onClick={ open }
                                        onKeyDown={ ( event ) => {
                                            if (
                                                'Enter' === event.key ||
                                                ' ' === event.key
                                            ) {
                                                open();
                                            }
                                        } }
                                    >
                                        { media && media.source_url ? (
                                            <img
                                                src={ media.source_url }
                                                alt={ media.alt_text || '' }
                                            />
                                        ) : (
                                            <div className="image-placeholder">
                                                <h5 className="image-placeholder-title">
                                                    Select an image
                                                </h5>

                                                <p className="image-placeholder-help">
                                                    Click to upload
                                                </p>
                                            </div>
                                        ) }
                                    </div>
                                ) }
                            />
                        </MediaUploadCheck>
                    </div>
                    <div className="media-text-content">
                        <div className="inner-blocks">
                            <InnerBlocks
                                template={ TEMPLATE }
                                allowedBlocks={ TEMPLATE }
                                renderAppender={
                                    InnerBlocks.ButtonBlockAppender
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Edit;
