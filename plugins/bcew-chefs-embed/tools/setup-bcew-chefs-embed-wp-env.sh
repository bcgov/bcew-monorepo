#!/bin/sh

set -eu

wp-env run cli bash -c 'wp config delete BCEW_CHEFS_E2E_MOCK --quiet || true; wp theme activate twentytwentyfive && wp plugin activate bcew-chefs-embed'
wp-env run tests-cli bash -c 'wp config set BCEW_CHEFS_E2E_MOCK true --raw && wp theme activate twentytwentyfive && wp plugin activate bcew-chefs-embed'
