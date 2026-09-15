/**
 * Next plugin or theme version from git tags.
 *
 * The GitHub Action does not ask for a version number. It asks which project
 * and whether this is an Alpha. This file turns those answers into the next
 * version string. Nx Release then stamps that number, commits, tags, and
 * publishes.
 *
 * Tags look like bcew-blocks/v1.0.0 or bcew-blocks/v1.0.0-alpha.1. This
 * module only sees the part after the "v".
 *
 * Rules we follow:
 * - Alphas count up on the same X.Y.Z (alpha.1, then alpha.2, then alpha.3).
 * - Unchecking Alpha ships that X.Y.Z if it is not tagged yet.
 * - After a real (non-alpha) release, the next series is the next minor
 *   (1.0.0 → 1.1.0). Patch and major are never bumped.
 * - Tags that are not X.Y.Z or X.Y.Z-alpha.N are ignored.
 */

const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-alpha\.(\d+))?$/;

/**
 * Parse a version we understand. Anything else is ignored.
 *
 * @param {string} value Version string without the tag prefix.
 * @return {{ major: number, minor: number, patch: number, alpha: number | null, raw: string } | null} Parsed version.
 */
export const parseReleaseVersion = ( value ) => {
	/*
	 * Only X.Y.Z and X.Y.Z-alpha.N count. Older Composer-style tags such as
	 * 1.1.0-a1 are skipped so they cannot pick the next number.
	 */
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
	/*
	 * Compare major, then minor, then patch. 1.1.0 is always newer than
	 * 1.0.0-alpha.99, even if that alpha number looks large.
	 */
	if ( left.major !== right.major ) {
		return left.major - right.major;
	}
	if ( left.minor !== right.minor ) {
		return left.minor - right.minor;
	}
	if ( left.patch !== right.patch ) {
		return left.patch - right.patch;
	}

	/*
	 * Same X.Y.Z: a real release (no alpha) is newer than every alpha of
	 * that core. 1.0.0 beats 1.0.0-alpha.5. Two alphas compare by number.
	 */
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
	/*
	 * Keep only versions we understand, then sort so the last item is the
	 * latest. That one tag decides what comes next.
	 */
	const parsed = tags.map( parseReleaseVersion ).filter( Boolean );
	parsed.sort( compareReleaseVersions );
	const latest = parsed[ parsed.length - 1 ];

	/*
	 * First release for this project. Start the 1.0.0 series, as an alpha
	 * if the box is checked.
	 */
	if ( ! latest ) {
		return isAlpha ? '1.0.0-alpha.1' : '1.0.0';
	}

	const core = `${ latest.major }.${ latest.minor }.${ latest.patch }`;
	const nextMinor = `${ latest.major }.${ latest.minor + 1 }.0`;

	if ( null !== latest.alpha ) {
		/*
		 * Latest tag is still an alpha. Another alpha ticks the number
		 * (alpha.2 → alpha.3). Unchecking Alpha ships this X.Y.Z unless
		 * that real version was already tagged, in which case we start
		 * the next minor instead.
		 */
		if ( isAlpha ) {
			return `${ core }-alpha.${ latest.alpha + 1 }`;
		}
		const coreAlreadyShipped = parsed.some( ( item ) => item.raw === core );
		return coreAlreadyShipped ? nextMinor : core;
	}

	/*
	 * Latest tag is a real release. The next work is always the next minor:
	 * 1.0.0 plus Alpha → 1.1.0-alpha.1, or 1.0.0 without Alpha → 1.1.0.
	 */
	return isAlpha ? `${ nextMinor }-alpha.1` : nextMinor;
};
