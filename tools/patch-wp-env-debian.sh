#!/usr/bin/env bash
set -euo pipefail

node <<'NODE'
const fs = require('node:fs');
const path = require('node:path');

const envEntry = require.resolve('@wordpress/env');
const dockerConfig = path.join(
  path.dirname(envEntry),
  'runtime',
  'docker',
  'docker-config.js'
);
const source = fs.readFileSync(dockerConfig, 'utf8');
const marker = 'RUN apt-get clean\nRUN apt-get -qy update';
const replacement =
  'RUN apt-get clean\n' +
  "RUN sed -i 's|deb.debian.org/debian bullseye|archive.debian.org/debian bullseye|g' /etc/apt/sources.list\n" +
  "RUN sed -i '/bullseye-security/d' /etc/apt/sources.list\n" +
  "RUN sed -i '/bullseye-updates/d' /etc/apt/sources.list\n" +
  "RUN echo 'Acquire::Check-Valid-Until \"false\";' > /etc/apt/apt.conf.d/99no-check-valid-until\n" +
  'RUN apt-get -qy update';

if (source.includes(replacement)) {
  console.log(`wp-env Debian patch already applied to ${dockerConfig}`);
  process.exit(0);
}

if (!source.includes(marker)) {
  throw new Error(`Unable to find the wp-env Debian apt source block in ${dockerConfig}`);
}

fs.writeFileSync(dockerConfig, source.replace(marker, replacement));
console.log(`Patched ${dockerConfig} for expired Debian repository metadata`);
NODE
