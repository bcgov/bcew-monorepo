#!/usr/bin/env node

/**
 * Sync all .wp-env.json files to match the centralized config.json.
 * This ensures version consistency across all themes and plugins.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

/**
 * Recursively find all .wp-env.json files in a directory.
 * @param {string} dir Directory path to search.
 * @returns {string[]} A list of .wp-env.json file paths.
 */
const findWpEnvFiles = (dir) => {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findWpEnvFiles(fullPath));
    } else if (entry.name === '.wp-env.json') {
      files.push(fullPath);
    }
  });

  return files;
};

// Find .wp-env.json files in themes and plugins
const themesDir = path.join(__dirname, '../../themes');
const pluginsDir = path.join(__dirname, '../../plugins');
const files = [];

if (fs.existsSync(themesDir)) {
  files.push(...findWpEnvFiles(themesDir));
}
if (fs.existsSync(pluginsDir)) {
  files.push(...findWpEnvFiles(pluginsDir));
}

if (files.length === 0) {
  console.log('No .wp-env.json files found to sync.');
  process.exit(0);
}

files.forEach((file) => {
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));
  const updated = {
    ...content,
    core: config.core,
    phpVersion: config.phpVersion,
  };
  fs.writeFileSync(file, JSON.stringify(updated, null, 2) + '\n');
  console.log(`✓ Synced ${path.relative(process.cwd(), file)}`);
});

console.log(`\n✓ All .wp-env.json files synced to versions from tools/wp-env/config.json`);
