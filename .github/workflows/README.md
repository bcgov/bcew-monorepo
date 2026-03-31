# Workflows

## Pull request checks (pr.yml)

Runs on every new commit in a PR. Features:

- Automatic PR labeling
  - Using `actions/labeler`, automatically sets PR labels based on files changed.
  - See `.github/labeler.yml` for label configuration.
    - Note: when a new sub-project (plugin or theme) is added to the monorepo, it should be added to the `labeler.yml` configuration.
- Files changed in the PR are analyzed using `nx affected` to determine which projects were affected. Only these projects will have the build and test steps run on them.
