<?php
// phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode
// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
$existing_json = file_exists( 'packages.json' ) ? json_decode( file_get_contents( 'packages.json' ), true ) : [ 'packages' => [] ];

// These variables would be passed from the GH Action environment.
$repository         = getenv( 'REPOSITORY' ); // e.g., "bcgov/bcew-monorepo".
$tag_name           = getenv( 'TAG' ); // e.g., "bcew-blocks/v1.2.0".
$version            = getenv( 'VERSION' ); // e.g., "v1.2.0".
$normalized_version = ltrim( $version, 'v' ); // e.g., "1.2.0".
$project_path       = getenv( 'PROJECT_PATH' ); // e.g., 'themes/theme-a' or 'plugins/plugin-b'.

// Load the local composer.json for this subproject to get 'require', 'autoload', etc.
// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
$local_metadata = json_decode( file_get_contents( "$project_path/composer.json" ), true );

// Construct the new version entry.
$new_entry = array_merge(
    $local_metadata,
    [
		'version' => $normalized_version,
		'dist'    => [
			'url'       => "https://github.com/$repository/releases/download/$tag_name/dist.zip",
			'type'      => 'zip',
			'reference' => $tag_name,
		],
		'source'  => [
			'type'      => 'git',
			'url'       => "https://github.com/$repository.git",
			'reference' => $tag_name,
		],
	]
);

// Remove unnecessary properties before merging into packages.
unset( $new_entry['repositories'] );
unset( $new_entry['require-dev'] );
unset( $new_entry['scripts'] );

// Update the master array.
$existing_json['packages'][ $new_entry['name'] ][ $normalized_version ] = $new_entry;

// Save back.
// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
file_put_contents(
    'public/packages.json',
// phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode
    json_encode( $existing_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES )
);
