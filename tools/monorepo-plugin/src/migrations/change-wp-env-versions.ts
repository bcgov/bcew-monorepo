import { readJson, Tree, visitNotIgnoredFiles, writeJson } from '@nx/devkit';

const TARGET_CORE_VERSION = 'WordPress/WordPress#6.8';
const TARGET_PHP_VERSION = '7.4';

function shouldMigrateWpEnvFile(filePath: string): boolean {
  const isWpEnvFile = filePath === '.wp-env.json' || filePath.endsWith('/.wp-env.json');

  if (!isWpEnvFile) {
    return false;
  }

  return (
    filePath === '.wp-env.json' ||
    filePath.startsWith('plugins/') ||
    filePath.startsWith('themes/') ||
    filePath.startsWith('tools/monorepo-plugin/src/generators/')
  );
}

export default function changePhpAndWpVersions(host: Tree) {
  visitNotIgnoredFiles(host, '.', (filePath) => {
    if (!shouldMigrateWpEnvFile(filePath)) {
      return;
    }

    const wpEnvConfig = readJson<Record<string, unknown>>(host, filePath);
    wpEnvConfig.core = TARGET_CORE_VERSION;
    wpEnvConfig.phpVersion = TARGET_PHP_VERSION;
    writeJson(host, filePath, wpEnvConfig);
  });
}
