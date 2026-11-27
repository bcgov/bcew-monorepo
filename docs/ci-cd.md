# CI/CD

GitHub Actions manages pull request validation, testing, releases, documentation deployment, and release cleanup.

## Pull request checks

`pr.yml` runs the main CI checks for pull requests and pushes to `main`. It coordinates the reusable quality, unit, integration, Playwright, and SonarQube workflows.

For pull requests, Nx limits applicable tests to affected projects. Pushes to `main` run the applicable test targets across all projects.

### Quality checks

`pr-quality.yml`:

- Applies labels based on changed files.
- Runs PHP, JavaScript, CSS, Markdown, `package.json`, and template-part linting.

### Unit tests

`pr-unit.yml` runs JavaScript unit tests.

Pull requests test affected projects. Pushes to `main` run the target across all applicable projects.

### Integration tests

`pr-integration.yml` runs PHP integration tests.

Pull requests test affected projects. Pushes to `main` run the target across all applicable projects.

PHP coverage is collected when available and passed to SonarQube.

### Playwright tests

`pr-playwright.yml` runs Playwright tests for projects that provide e2e, accessibility, or screenshot test targets.

Pull requests test affected projects. Pushes to `main` test all applicable projects.

Each project runs separately. Failed Playwright runs upload test results, including available screenshot differences and traces.

### SonarQube

`pr-sonarqube.yml` runs the SonarQube scan after integration tests and includes PHP coverage when available.

## Pull request titles

`pr-title.yml` validates pull request titles against the repository's supported Conventional Commit types:

- `feat`
- `fix`
- `perf`
- `revert`
- `docs`
- `style`
- `refactor`
- `test`
- `build`
- `ci`
- `chore`

The scope is optional.

## Screenshot generation

`screenshot.yml` is a manually triggered workflow for regenerating screenshot baselines for a selected project.

It:

1. Runs the project's `test-screenshot-generate` target.
2. Commits changed snapshots.
3. Pushes the changes back to the current branch.

The workflow does not run against `main`.

## Releases

`tag.yml` is the manual release workflow for WordPress plugins and themes.

The maintainer selects:

- the project
- whether the release is an alpha
- an optional version

If no version is supplied, Nx determines the release version.

The workflow:

1. Runs Nx Release for the selected project.
2. Creates the release tag and GitHub Release.
3. Builds the release archive.
4. Uploads the ZIP to the GitHub Release.
5. Updates the Composer `packages.json`.
6. Publishes the updated Composer repository to GitHub Pages.

Release tags use the project name and version:

```text
<nx-project-name>/v<semver>
```

Release operations use a GitHub App token so the workflow can commit and create tags where repository protection requires it.

## Deleted releases

`tag-delete.yml` runs when a Git tag is deleted.

For supported release tags, it removes the corresponding release metadata from `packages.json` and republishes the Composer repository to GitHub Pages.

Release creation and deletion share a concurrency group so they cannot update `packages.json` at the same time.

## Documentation

`deploy-docs.yml` builds the VitePress documentation site when relevant documentation or documentation-build files change.

Pull requests build the documentation without deploying it.

Changes on `main` and manually triggered runs publish the generated site to the `docs` directory on GitHub Pages.

## Shared workflow setup

`.github/actions/setup/action.yml` provides common dependency setup for workflows.

It:

- Configures Node.js 24.
- Configures pnpm 10 and installs dependencies from the lockfile.
- Optionally installs Composer dependencies with caching.

Individual workflows enable Composer setup only when required.

## Dependency updates

Dependabot manages dependency update pull requests:

- npm dependencies are checked daily.
- Composer dependencies are checked weekly.
- Updates are assigned to the `bcgov/digital-engagement-solutions-custom-web` team for review.

Dependabot limits each package ecosystem to three open pull requests.

## Pull request labels

`.github/labeler.yml` automatically labels pull requests based on changed paths.

Labels identify:

- monorepo-level changes
- plugin changes
- theme changes
- specific plugins and themes

