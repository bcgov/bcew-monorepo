/**
 * Checks for next-release-version.mjs.
 *
 * These cases are the version policy in table form: empty tags, counting
 * alphas, promoting an alpha to a real X.Y.Z, and moving to the next minor
 * after a real release. Run with:
 *   node .github/scripts/next-release-version.test.mjs
 */

import { nextReleaseVersion } from './next-release-version.mjs';

/*
 * Each row is [existing tag versions, Alpha checkbox, expected next version].
 *
 * No tags yet → start 1.0.0 (alpha.1 if Alpha is checked).
 * Alphas on the same core count up; unchecking Alpha ships that core.
 * After a real 1.0.0, the next series is 1.1.0.
 * A mix of 1.0.0 and 1.1.0-alpha.N still counts alphas on 1.1.0.
 */
const cases = [
	[ [], true, '1.0.0-alpha.1' ],
	[ [], false, '1.0.0' ],
	[ [ '1.0.0-alpha.1' ], true, '1.0.0-alpha.2' ],
	[ [ '1.0.0-alpha.1', '1.0.0-alpha.2' ], true, '1.0.0-alpha.3' ],
	[ [ '1.0.0-alpha.1', '1.0.0-alpha.2' ], false, '1.0.0' ],
	[ [ '1.0.0' ], true, '1.1.0-alpha.1' ],
	[ [ '1.0.0' ], false, '1.1.0' ],
	[ [ '1.0.0', '1.1.0-alpha.1' ], true, '1.1.0-alpha.2' ],
	[ [ '1.0.0', '1.1.0-alpha.3' ], false, '1.1.0' ],
];

let failed = 0;
for ( const [ tags, isAlpha, expected ] of cases ) {
	const actual = nextReleaseVersion( tags, isAlpha );
	if ( actual !== expected ) {
		console.error( `FAIL tags=${ JSON.stringify( tags ) } alpha=${ isAlpha }: got ${ actual }, expected ${ expected }` );
		failed += 1;
	}
}

if ( failed ) {
	process.exit( 1 );
}
console.log( `Passed ${ cases.length } next-release-version cases` );
