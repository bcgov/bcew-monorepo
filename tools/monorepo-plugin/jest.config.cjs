module.exports = {
    displayName: 'monorepo-plugin',
    testEnvironment: 'node',
    testMatch: [ '<rootDir>/src/**/*.spec.ts' ],
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
    moduleFileExtensions: [ 'ts', 'js', 'json' ],
    coverageDirectory: '<rootDir>/../../coverage/tools/monorepo-plugin',
};
