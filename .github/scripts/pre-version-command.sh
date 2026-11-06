#!/usr/bin/env bash

set -euo pipefail

PROJECT_PATH="${1:?project path required}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
ARCHIVE_PATH="${REPO_ROOT}/${PROJECT_PATH}/__release-archive__"

rm -rf "${ARCHIVE_PATH}";
cd "${REPO_ROOT}/${PROJECT_PATH}"
mkdir -p "${ARCHIVE_PATH}"

git archive HEAD | tar -x -C "${ARCHIVE_PATH}"
if [[ -d "./dist" ]]; then
  cp -R "./dist" "${ARCHIVE_PATH}/dist"
fi