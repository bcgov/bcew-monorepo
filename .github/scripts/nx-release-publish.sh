#!/usr/bin/env bash

# Publish a project's prepared release archive to a GitHub Release, then update
# the repository's Composer package feed.
#
# Usage: nx-release-publish.sh <project-path> <project-name> [tag]
#   project-path  Repository-relative path to the project. Its release files
#                 must already be in <project-path>/__release-archive__.
#   project-name  Used to locate a tag when the optional tag is not supplied.
#   tag           GitHub Release tag to publish. If omitted, the newest
#                 version-sorted <project-name>/v* tag pointing to HEAD is used.
#
# Requires git, zip, gh, curl, and PHP; gh must be authenticated for the target
# repository. REPOSITORY and PACKAGES_JSON_URL can override the inferred GitHub
# repository and Composer feed URL. If the feed download fails, the script
# initializes an empty packages.json before updating it.

set -euo pipefail
PROJECT_PATH="${1:?project path required}"
PROJECT_NAME="${2:?project name required}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
ARCHIVE_PATH="${REPO_ROOT}/${PROJECT_PATH}/__release-archive__"

# Package the prepared release directory as the asset uploaded to GitHub.
ASSET_NAME="${PROJECT_NAME}-$(git rev-parse HEAD).zip"
ZIP="${ARCHIVE_PATH}/${ASSET_NAME}"
cd "${REPO_ROOT}"

# Cleans up if required
rm -rf "${ARCHIVE_PATH}"
mkdir -p "${ARCHIVE_PATH}"

# Extract the HEAD, ensuring to use the root .gitattributes file, it then is extracted to add dist and updated version file
git archive --worktree-attributes HEAD "${PROJECT_PATH}" \
  | tar -x \
      --strip-components=2 \
      -C "${ARCHIVE_PATH}"

# Moves the updated style.css or project_name.php file to the dist, as nx version would have updated it, it needs to be copied.
# This step prevents requiring a prerelease command.
if [[ -f "style.css" ]]; then
    cp "${REPO_ROOT}/${PROJECT_PATH}/style.css" "${REPO_ROOT}/${PROJECT_PATH}/__release-archive__/style.css"
elif [[ -f "${REPO_ROOT}/${PROJECT_PATH}/${PROJECT_NAME}.php" ]]; then
    cp "${REPO_ROOT}/${PROJECT_PATH}/${PROJECT_NAME}.php" "${REPO_ROOT}/${PROJECT_PATH}/__release-archive__/${PROJECT_NAME}.php"
fi

# Copies the dist folder across
if [[ -d "${PROJECT_PATH}/dist" ]]; then
    cp -R "${PROJECT_PATH}/dist" "${ARCHIVE_PATH}/dist"
fi

# because nx wants to change a tracked file, need to do this to untrack this file.



# cleans up any old zip and re-creates
rm -f "${ZIP}"
(
  cd "${ARCHIVE_PATH}"
  zip -rq "${ZIP}" .
)

TAG="$(
    git tag \
        --points-at HEAD \
        --list "${PROJECT_NAME}/v*" \
        --sort=-version:refname |
    head -n 1
)"

if [[ -z "${TAG}" ]]; then
    echo "No release tag found for ${PROJECT_NAME}"
    exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "gh is required to attach ${ZIP} to GitHub Release ${TAG}"
  exit 1
fi


# Uploads the release file
gh release upload "${TAG}" "${ZIP}"

## this publishes the release
gh release edit "${TAG}" --draft=false

## This needs to be part of a workflow, otherwise if this gets run in this script, bad things could happen.
git stash

## This will eventually be removed into workflow

rm -rf "${REPO_ROOT}/public"
mkdir -p "${REPO_ROOT}/public"
ZIP_SHASUM="$(shasum -a 1 "${ZIP}" | cut -d' ' -f1)"
GITHUB_SHA="$(git rev-parse HEAD)"
RELEASE_INFO="$(
    gh release view "${TAG}" --json tagName,assets,url |
    jq \
        --arg zipsha "${ZIP_SHASUM}" \
        --arg gitsha "${GITHUB_SHA}" \
        --arg project "${PROJECT_PATH}" \
        '. + {
            zipsha: $zipsha,
            gitsha: $gitsha,
            project: $project
        }'
)"

php .github/scripts/update-packages.php  --release-info "$RELEASE_INFO"