<?php
// phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode
// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
$existing_json = file_exists( 'packages.json' ) ? json_decode( file_get_contents( 'packages.json' ), true ) : [ 'packages' => [] ];
$options       = getopt( '', [ 'project-path:', 'asset-name:', 'tag:', 'repository:' ] );
// These variables would be passed from the GH Action environment.
$repository = $options['repository'] ?? getenv( 'REPOSITORY' ); // e.g., "bcgov/bcew-monorepo".
$tag_name   = $options['tag'] ?? getenv( 'TAG' ); // e.g., "bcew-blocks/v1.2.0".

preg_match( '/\/v(\d+\.\d+\.\d+(?:[.-][a-zA-Z0-9.-]+)?$)/', $tag_name, $matches );
$version      = $matches[1] ?? null;
$project_path = $options['project-path'] ?? getenv( 'PROJECT_PATH' ); // e.g., 'themes/theme-a' or 'plugins/plugin-b'.
$asset_name   = $options['asset-name'] ?? getenv( 'ASSET_NAME' ); // e.g., "bcew-blocks-1.2.0.zip".

// Load the local composer.json for this subproject to get 'require', 'autoload', etc.
// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
$local_metadata = json_decode( file_get_contents( "$project_path/composer.json" ), true );

// Construct the new version entry.
$new_entry = array_merge(
    $local_metadata,
    [
		'version' => $version,
		'dist'    => [
			'url'       => "https://github.com/$repository/releases/download/$tag_name/$asset_name",
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

$package_name = $new_entry['name'] ?? null;
if ( ! $package_name ) {
	throw new RuntimeException( 'The local composer.json must define a package name.' );
}

$existing_json['packages']                  ??= [];
$existing_json['packages'][ $package_name ] ??= [];
$existing_json['packages'][ $package_name ][] = $new_entry;

// Save back.
// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
try {
	// phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode
	$json = json_encode( $existing_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
	if ( false === $json ) {
		throw new RuntimeException( 'Could not encode packages.json.' );
	}

	$result = file_put_contents( 'public/packages.json', $json );
	if ( false === $result ) {
		throw new RuntimeException( 'Could not write public/packages.json.' );
	}

	echo "Successfully updated public/packages.json.\n";
} catch ( Throwable $exception ) {
	echo "Failed to update public/packages.json: {$exception->getMessage()}\n";
}
