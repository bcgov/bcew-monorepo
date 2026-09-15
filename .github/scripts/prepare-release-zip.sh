#!/usr/bin/env bash
set -euo pipefail

PROJECT_PATH="${1:?project path required}"
PROJECT_NAME="${2:?project name required}"
VERSION="${3:-}"
ASSET_NAME="${ASSET_NAME:?ASSET_NAME required}"

REPO_ROOT="$(git rev-parse --show-toplevel)"
OUTPUT_ZIP="${REPO_ROOT}/${PROJECT_PATH}/${ASSET_NAME}"

cd "${REPO_ROOT}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

(
  cd "${PROJECT_PATH}"
  git archive HEAD . | tar -x -C "${TMP}"
)

if [[ -d "${PROJECT_PATH}/dist" ]]; then
  cp -R "${PROJECT_PATH}/dist" "${TMP}/dist"
fi

# Stamp Version in the zip as a safety net. Git already has the header after
# Nx Release, including prereleases. This still covers plugin files that are
# not named after the Nx project.
if [[ -n "${VERSION}" ]]; then
  set_wordpress_version() {
    local file="$1"
    local pattern="$2"
    sed "${pattern}" "${file}" > "${file}.tmp"
    mv "${file}.tmp" "${file}"
  }

  if [[ -f "${TMP}/style.css" ]]; then
    set_wordpress_version "${TMP}/style.css" "s/^Version:[[:space:]]*.*/Version:      ${VERSION}/"
    echo "Set theme version to ${VERSION} in release style.css"
  else
    plugin_file=""
    if [[ -f "${TMP}/${PROJECT_NAME}.php" ]]; then
      plugin_file="${TMP}/${PROJECT_NAME}.php"
    else
      for candidate in "${TMP}"/*.php; do
        [[ -f "${candidate}" ]] || continue
        if grep -q "Plugin Name:" "${candidate}"; then
          plugin_file="${candidate}"
          break
        fi
      done
    fi

    if [[ -n "${plugin_file}" ]]; then
      set_wordpress_version "${plugin_file}" "s/^\([[:space:]]*\*[[:space:]]*Version:\)[[:space:]]*.*/\\1           ${VERSION}/"
      echo "Set plugin version to ${VERSION} in release $(basename "${plugin_file}")"
    else
      echo "No style.css or plugin bootstrap in release tree — skipping version update."
    fi
  fi
fi

rm -f "${OUTPUT_ZIP}"
(
  cd "${TMP}"
  zip -rq "${OUTPUT_ZIP}" .
)

echo "Created ${OUTPUT_ZIP}"
