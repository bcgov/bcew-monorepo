#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="${1:?project name required}"

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "${REPO_ROOT}"

if [[ -d "plugins/${PROJECT_NAME}" ]]; then
  PROJECT_PATH="plugins/${PROJECT_NAME}"
elif [[ -d "themes/${PROJECT_NAME}" ]]; then
  PROJECT_PATH="themes/${PROJECT_NAME}"
else
  echo "Unknown project ${PROJECT_NAME}: expected plugins/${PROJECT_NAME} or themes/${PROJECT_NAME}"
  exit 1
fi
VERSION="$(jq -r .version "${PROJECT_PATH}/package.json")"

if [[ -z "${VERSION}" || "${VERSION}" == "null" ]]; then
  echo "No version in ${PROJECT_PATH}/package.json"
  exit 1
fi

TAG="${PROJECT_NAME}/v${VERSION}"
ASSET_NAME="${PROJECT_NAME}-${VERSION}.zip"
export ASSET_NAME

if [[ "${NX_DRY_RUN:-}" == "true" ]]; then
  echo "Dry run: would build, zip ${ASSET_NAME}, upload to ${TAG}, and update packages.json"
  exit 0
fi

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

gh release upload "${TAG}" "${ZIP}" --clobber

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
