import { nextReleaseVersion } from './next-release-version.mjs';

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
