#!/usr/bin/env bash

set -euo pipefail

PROJECT_PATH="${1:?project path required}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
ARCHIVE_PATH="${REPO_ROOT}/${PROJECT_PATH}/__release-archive__"

cd "${REPO_ROOT}"

rm -rf "${ARCHIVE_PATH}"
mkdir -p "${ARCHIVE_PATH}"

git archive HEAD "${PROJECT_PATH}" \
  | tar -x \
      --strip-components=2 \
      -C "${ARCHIVE_PATH}"

if [[ -d "${PROJECT_PATH}/dist" ]]; then
    cp -R "${PROJECT_PATH}/dist" "${ARCHIVE_PATH}/dist"
fi
