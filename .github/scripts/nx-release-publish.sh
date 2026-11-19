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
ZIP="${ARCHIVE_PATH}/${PROJECT_NAME}-$(git rev-parse HEAD).zip"

cd "${REPO_ROOT}"

# cleans up any old zip and re-creates
rm -f "${ZIP}"
(
  cd "${ARCHIVE_PATH}"
  zip -rq "${ZIP}" .
)

# Checks to see if the tag was created.
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

# This adds all of the required env variables so github workflow has access to them
if [[ -n "${GITHUB_ENV:-}" ]]; then
    {
        echo "TAG=${TAG}"
        echo "ZIP=${ZIP}"
        echo "PROJECT_PATH=${PROJECT_PATH}"
    } >> "${GITHUB_ENV}"
fi
