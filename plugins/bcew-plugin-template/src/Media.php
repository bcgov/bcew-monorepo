<?php
/**
 * Handles uploads and media library changes.
 *
 * @package Bcgov\Bcew\PluginTemplate
 */

namespace Bcgov\Bcew\PluginTemplate;

/**
 * Uploads and media library changes.
 */
class Media {

	/**
	 * Run after WordPress stores an uploaded file.
	 *
	 * Plugin calls this from add_attachment, so this file is not loaded on a normal page view.
	 *
	 * @param int $attachment_id Attachment post ID.
	 */
	public function handle_upload( $attachment_id ) {
		unset( $attachment_id );
	}
}
