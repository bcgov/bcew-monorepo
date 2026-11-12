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
# Package the prepared release directory as the asset uploaded to GitHub.
ARCHIVE_PATH="${REPO_ROOT}/${PROJECT_PATH}/__release-archive__"
ASSET_NAME="dist-$(git rev-parse HEAD).zip"
ZIP="${ARCHIVE_PATH}/${ASSET_NAME}"

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


# --clobber replaces a zip from a retried run on the same tag.
gh release upload "${TAG}" "${ZIP}" --clobber