#!/usr/bin/env bash

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"

PROJECT_PATH="${1:?project path required}"
PROJECT_NAME="${2:?project name required}"
ARCHIVE_PATH="${REPO_ROOT}/${PROJECT_PATH}/__release-archive__"

cd "${REPO_ROOT}"

# Cleans up if required
rm -rf "${ARCHIVE_PATH}"
mkdir -p "${ARCHIVE_PATH}"

# Extract the HEAD, ensuring to use the root .gitattributes file, it then is extracted to add dist and updated version file
git archive --worktree-attributes HEAD "${PROJECT_PATH}" \
  | tar -x \
      --strip-components=2 \
      -C "${ARCHIVE_PATH}"

# Copies the dist folder across
if [[ -d "${PROJECT_PATH}/dist" ]]; then
    cp -R "${PROJECT_PATH}/dist" "${ARCHIVE_PATH}/dist"
fi



