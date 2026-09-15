/**
 * Next plugin/theme version from git tags.
 *
 * Tags look like bcew-blocks/v1.0.0 or bcew-blocks/v1.0.0-alpha.1.
 * Alpha ticks count up on the same X.Y.Z. Unchecking alpha ships that X.Y.Z
 * if it is not tagged yet. After a real release, the next series is the next minor
 * (1.0.0 → 1.1.0). Patch and major are never bumped.
 */

const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-alpha\.(\d+))?$/;

/**
 * Parse a version we understand. Anything else is ignored.
 *
 * @param {string} value Version string without the tag prefix.
 * @return {{ major: number, minor: number, patch: number, alpha: number | null, raw: string } | null} Parsed version.
 */
export const parseReleaseVersion = ( value ) => {
	const match = String( value ).match( VERSION_PATTERN );
	if ( ! match ) {
		return null;
	}
	return {
		major: Number( match[ 1 ] ),
		minor: Number( match[ 2 ] ),
		patch: Number( match[ 3 ] ),
		alpha: undefined === match[ 4 ] ? null : Number( match[ 4 ] ),
		raw: match[ 0 ],
	};
};

/**
 * Sort helper: higher core version wins; a real release is newer than its alphas.
 *
 * @param {ReturnType<typeof parseReleaseVersion>} left Left version.
 * @param {ReturnType<typeof parseReleaseVersion>} right Right version.
 * @return {number} Compare result.
 */
const compareReleaseVersions = ( left, right ) => {
	if ( left.major !== right.major ) {
		return left.major - right.major;
	}
	if ( left.minor !== right.minor ) {
		return left.minor - right.minor;
	}
	if ( left.patch !== right.patch ) {
		return left.patch - right.patch;
	}
	if ( left.alpha === null && right.alpha === null ) {
		return 0;
	}
	if ( left.alpha === null ) {
		return 1;
	}
	if ( right.alpha === null ) {
		return -1;
	}
	return left.alpha - right.alpha;
};

/**
 * Decide the next version from existing tag versions and the alpha checkbox.
 *
 * @param {string[]} tags    Version strings (no project prefix, no leading v).
 * @param {boolean}  isAlpha Whether the Alpha box is checked.
 * @return {string} Next version.
 */
export const nextReleaseVersion = ( tags, isAlpha ) => {
	const parsed = tags.map( parseReleaseVersion ).filter( Boolean );
	parsed.sort( compareReleaseVersions );
	const latest = parsed[ parsed.length - 1 ];

	if ( ! latest ) {
		return isAlpha ? '1.0.0-alpha.1' : '1.0.0';
	}

	const core = `${ latest.major }.${ latest.minor }.${ latest.patch }`;
	const nextMinor = `${ latest.major }.${ latest.minor + 1 }.0`;

	if ( null !== latest.alpha ) {
		if ( isAlpha ) {
			return `${ core }-alpha.${ latest.alpha + 1 }`;
		}
		const coreAlreadyShipped = parsed.some( ( item ) => item.raw === core );
		return coreAlreadyShipped ? nextMinor : core;
	}

	return isAlpha ? `${ nextMinor }-alpha.1` : nextMinor;
};
