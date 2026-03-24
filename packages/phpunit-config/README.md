# PHPUnit Config

This package demonstrates how internally sharing Composer code between plugins/themes could work. Doing it this way means not having to use brittle relative paths.

## Usage

In the plugin or theme `composer.json`:

```json
    "repositories": [
        {
            "type": "path",
            "url": "../../packages/phpunit-config",
            "options": {
                // Note: This makes it so we must run composer update whenever changes are made to the shared code, instead of it automatically updating due to the symlink. Using symlinks doesn't work with wp-env however, because the symlink doesn't point to the right location when inside the wp-env container.
                "symlink": false
            }
        }
    ],
```

And:

```json
    "require-dev": {
        "wordpress-monorepo/phpunit-config": "dev-main",
    }
```
