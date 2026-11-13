<?php
/**
 * Updates the packages.json file with the latest release information for a given project.
 *
 * This script is intended to be run in a CI/CD pipeline after a new release has been published.
 * It fetches the existing packages.json, updates it with the new release information, and saves it back.
 *
 * Usage:
 *   php update-packages.php --project-path <path> --release-info <json> --hash <commit-hash>
 *
 * Options:
 *   --project-path  The path to the project (e.g., 'themes/theme-a' or 'plugins/plugin-b').
 *   --release-info  JSON string containing release info from GitHub API.
 *   --hash          Commit hash for this release.
 *
 * Example:
 *   php update-packages.php --project-path "themes/theme-a" --release-info '{"tagName":"theme-a/v1.2.3","assets":[{"url":"

/**
 * Extracts release information from a GitHub release JSON string.
 *
 * @param string $release_info The JSON string with release info from GitHub API.
 * @return array The parsed release information.
 * @throws RuntimeException If the JSON is invalid or missing required keys.
 */
function get_release_info_from_github( string $release_info ): array {
	$release_info = json_decode( $release_info, true );
	if ( ! is_array( $release_info ) && ! isset( $release_info['tagName'], $release_info['assets'], $release_info['url'] ) ) {
		throw new RuntimeException( 'Invalid release info JSON provided to get_release_info_from_github().' );
	}
	if ( preg_match( '#github\.com/(?P<owner>[^/]+)/(?P<repo>[^/]+)#', $release_info['url'], $matches ) ) {
		$release_info['repository'] = "{$matches['owner']}/{$matches['repo']}";
	} else {
		throw new RuntimeException( 'Could not extract repository name from release URL' );
	}

	return $release_info;
}

/**
 * Extracts the package name and version from a GitHub release tag.
 *
 * @param string $tag The GitHub release tag (e.g., 'package-name/v1.2.3').
 * @return array An associative array with 'package' and 'version' keys.
 * @throws RuntimeException If the tag does not match the expected pattern.
 */
function get_package_and_version_from_tag( string $tag ): array {
	$pattern = '/^(?P<package>[^\/]+)\/v(?P<version>.+)$/';
	if ( ! preg_match( $pattern, $tag, $matches ) ) {
		throw new RuntimeException( 'Tag does not match the expected pattern.' );
	}
	return [
		'package' => $matches['package'],
		'version' => $matches['version'],
	];
}



// phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode
// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
$existing_json = json_decode( file_get_contents( 'https://bcgov.github.io/bcew-monorepo/packages.json' ) ?? [ 'packages' => [] ], true );
$args          = [];
$argc          = count( $argv );

for ( $i = 1; $i < $argc; $i += 2 ) {
    $key          = ltrim( $argv[ $i ], '-' );
    $args[ $key ] = $argv[ $i + 1 ] ?? null;
}
$project_path = $args['project-path'] ?? getenv( 'PROJECT_PATH' ); // e.g., 'themes/theme-a' or 'plugins/plugin-b'.
$hash         = $args['hash2'] ?? getenv( 'GITHUB_SHA' ); // Commit hash for this release.
$release_info = get_release_info_from_github( $args['release-info'] ?? [] ); // JSON string with release info from GitHub API.

// Load the local composer.json for this subproject to get 'require', 'autoload', etc.
// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
$local_metadata = json_decode( file_get_contents( "$project_path/composer.json" ), true );
// Construct the new version entry.
$new_entry = array_merge(
    $local_metadata,
    [
		'version' => get_package_and_version_from_tag( $release_info['tagName'] )['version'],
		'source'  => [
			'type'      => 'git',
			'url'       => "https://github.com/{$release_info['repository']}.git",
			'reference' => $hash,
		],
		'dist'    => [
			'url'       => $release_info['assets'][0]['url'] ?? '',
			'type'      => 'zip',
			'reference' => $hash,
			'shasum'    => str_replace( 'sha256:', '', $release_info['assets'][0]['digest'] ?? '' ), // Optional: You can compute the SHA1 checksum of the zip file if needed.
		],

	]
);


// Remove unnecessary properties before merging into packages.
unset( $new_entry['repositories'] );
unset( $new_entry['require-dev'] );
unset( $new_entry['scripts'] );
unset( $new_entry['config'] );
// Update the master array.

$package_name = $new_entry['name'] ?? null;
if ( ! $package_name ) {
	throw new RuntimeException( 'The local composer.json must define a package name.' );
}

$existing_json['packages']                  ??= [];
$existing_json['packages'][ $package_name ] ??= [];
$existing_json['packages'][ $package_name ][ $new_entry['version'] ] = $new_entry;


try {
	// phpcs:ignore WordPress.WP.AlternativeFunctions.json_encode_json_encode
	$json = json_encode( $existing_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
	if ( false === $json ) {
		throw new RuntimeException( 'Could not encode packages.json.' );
	}
	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
	$result = file_put_contents( 'public/packages.json', $json );
	if ( false === $result ) {
		throw new RuntimeException( 'Could not write public/packages.json.' );
	}

	echo "Successfully updated public/packages.json.\n";
} catch ( Throwable $exception ) {
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	echo "Failed to update public/packages.json: {$exception->getMessage()}\n";
}
