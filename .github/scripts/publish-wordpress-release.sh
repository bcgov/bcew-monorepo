#!/usr/bin/env bash
#
# Publish step for Nx Release (the nx-release-publish target in nx.json).
#
# By the time this runs, Nx has already:
# - written the version into package.json and the project changelog
# - committed and tagged {project}/v{version}
# - created the GitHub Release
# Plugin PHP and theme style.css are left as they are in git. The zip
# script stamps the WordPress Version header on a temp copy only.
#
# This script builds the plugin or theme, zips it, attaches the zip to that
# Release, and adds the version to packages.json so Composer sites can install
# it. composer.json itself is never given a "version" field; Composer reads
# the number from git tags plus this packages.json file.
#
# Nx passes the project name as $1. Extra args (for example --dryRun) are
# ignored so a nested Nx call cannot break the path lookup.

set -euo pipefail

PROJECT_NAME="${1:?project name required}"

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "${REPO_ROOT}"

# WordPress projects live under plugins/ or themes/. The folder name matches the Nx project name.
if [[ -d "plugins/${PROJECT_NAME}" ]]; then
  PROJECT_PATH="plugins/${PROJECT_NAME}"
elif [[ -d "themes/${PROJECT_NAME}" ]]; then
  PROJECT_PATH="themes/${PROJECT_NAME}"
else
  echo "Unknown project ${PROJECT_NAME}: expected plugins/${PROJECT_NAME} or themes/${PROJECT_NAME}"
  exit 1
fi

# package.json already has the version Nx just wrote. That is the zip name and the GitHub Release tag.
VERSION="$(jq -r .version "${PROJECT_PATH}/package.json")"

if [[ -z "${VERSION}" || "${VERSION}" == "null" ]]; then
  echo "No version in ${PROJECT_PATH}/package.json"
  exit 1
fi

TAG="${PROJECT_NAME}/v${VERSION}"
ASSET_NAME="${PROJECT_NAME}-${VERSION}.zip"
export ASSET_NAME

# Nx sets NX_DRY_RUN during --dry-run. Skip zip, upload, and packages.json so a preview does not publish.
if [[ "${NX_DRY_RUN:-}" == "true" ]]; then
  echo "Dry run: would build, zip ${ASSET_NAME}, upload to ${TAG}, and update packages.json"
  exit 0
fi

# Install PHP deps and build front-end assets so dist/ is in the zip.
pnpm nx run "${PROJECT_NAME}:composer-install"
pnpm nx run "${PROJECT_NAME}:build"

bash .github/scripts/prepare-release-zip.sh \
  "${PROJECT_PATH}" \
  "${PROJECT_NAME}" \
  "${VERSION}"

ZIP="${REPO_ROOT}/${PROJECT_PATH}/${ASSET_NAME}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh is required to attach ${ZIP} to GitHub Release ${TAG}"
  exit 1
fi

# --clobber replaces a zip from a retried run on the same tag.
gh release upload "${TAG}" "${ZIP}" --clobber

# update-packages.php expects TAG, VERSION (with a leading v), PROJECT_PATH,
# ASSET_NAME, and REPOSITORY. Download the live Composer feed first so we
# add this version instead of wiping the file.
REPOSITORY="${REPOSITORY:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"
export REPOSITORY
export TAG
export VERSION="v${VERSION}"
export PROJECT_PATH
export ASSET_NAME

PACKAGES_JSON_URL="${PACKAGES_JSON_URL:-https://${REPOSITORY%%/*}.github.io/${REPOSITORY##*/}/packages.json}"
curl --tlsv1.2 -sSf "${PACKAGES_JSON_URL}" -o packages.json \
  || echo '{"packages":{}}' > packages.json

mkdir -p public
php .github/scripts/update-packages.php

echo "Published ${ASSET_NAME} to ${TAG} and wrote public/packages.json"
