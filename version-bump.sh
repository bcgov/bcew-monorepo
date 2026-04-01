#!/bin/bash
# version-bump.sh - Automatically update block versions when plugin code changes

set -e

echo "Checking for affected projects..."

# Get affected projects as a newline-separated list
AFFECTED_PROJECTS=$(nx show projects --affected --json | jq -r '.[]')

# Check if any affected projects are plugins
# Get list of plugin project names (directories in plugins/)
PLUGIN_NAMES=$(ls plugins/ 2>/dev/null | tr '\n' '|' | sed 's/|$//')
PLUGIN_CHANGES=$(echo "$AFFECTED_PROJECTS" | grep -E "$PLUGIN_NAMES" || true)

if [ -z "$PLUGIN_CHANGES" ]; then
    echo "No plugin changes detected. Skipping version update."
    exit 0
fi

echo "Plugin changes detected in:"
echo "$PLUGIN_CHANGES"
echo

# Get current version from one of the block.json files
CURRENT_VERSION=$(cat plugins/bcgov-wordpress-blocks/src/sample-block/block.json | jq -r '.version' 2>/dev/null || echo "unknown")

echo "Current block version: $CURRENT_VERSION"
read -p "Enter new version: " NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    echo "No version provided. Skipping update."
    exit 1
fi

echo "Updating all block versions to $NEW_VERSION..."
nx generate monorepo-plugin:block-version-update "$NEW_VERSION"

echo "Version update complete!"
