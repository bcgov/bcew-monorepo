import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { ExternalLink, Notice, PanelBody, SelectControl } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';

import { getEmbedConfigUrl } from './embed-config';
import { loadViewer } from './loader';

const Edit = ( { attributes, setAttributes } ) => {
	const { formId } = attributes;
	const forms = window.bcewChefsFormSettings?.forms ?? [];
	const settingsUrl = window.bcewChefsFormSettings?.settingsUrl;
	const previewRef = useRef( null );

	const options = [
		{ label: __( 'Select a form…', 'bcew-chefs-form' ), value: '' },
		...forms.map( ( id ) => ( {
			label: id,
			value: id,
		} ) ),
	];

	useEffect( () => {
		const el = previewRef.current;
		if ( ! el || ! formId ) {
			el?.replaceChildren();
			return undefined;
		}

		let cancelled = false;

		fetch( getEmbedConfigUrl( formId ) )
			.then( ( response ) => response.json() )
			.then( async ( config ) => {
				if ( cancelled || ! config.success ) {
					return;
				}
				await loadViewer( el, config );
			} )
			.catch( () => {} );

		return () => {
			cancelled = true;
			el.replaceChildren();
		};
	}, [ formId ] );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'CHEFS Form', 'bcew-chefs-form' ) }>
					{ forms.length === 0 ? (
						<Notice status="warning" isDismissible={ false }>
							{ __( 'No forms configured.', 'bcew-chefs-form' ) }{ ' ' }
							{ settingsUrl && (
								<ExternalLink href={ settingsUrl }>
									{ __( 'Add credentials', 'bcew-chefs-form' ) }
								</ExternalLink>
							) }
						</Notice>
					) : (
						<SelectControl
							label={ __( 'Form', 'bcew-chefs-form' ) }
							value={ formId }
							options={ options }
							onChange={ ( value ) =>
								setAttributes( { formId: value } )
							}
						/>
					) }
				</PanelBody>
			</InspectorControls>

			<div
				{ ...useBlockProps( { className: 'bcew-chefs-form-block' } ) }
			>
				{ formId ? (
					<div className="bcew-chefs-form__preview">
						<div
							ref={ previewRef }
							className="bcew-chefs-form__webcomponent"
						/>
						<div
							className="bcew-chefs-form__overlay"
							aria-hidden="true"
						/>
					</div>
				) : (
					<Notice status="warning" isDismissible={ false }>
						{ __( 'Select a form in block settings.', 'bcew-chefs-form' ) }
					</Notice>
				) }
			</div>
		</>
	);
};

export default Edit;
