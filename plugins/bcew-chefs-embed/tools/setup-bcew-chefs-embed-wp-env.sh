#!/bin/sh

set -eu

wp-env run cli bash -c 'wp config delete BCEW_CHEFS_E2E_MOCK --quiet || true; wp theme activate twentytwentyfive && wp plugin activate bcew-chefs-embed'
wp-env run tests-cli bash -c 'rm -f wp-content/mu-plugins/bcew-chefs-embed-e2e-mock.php; wp config delete BCEW_CHEFS_E2E_MOCK --quiet || true; wp theme activate twentytwentyfive && wp plugin activate bcew-chefs-embed'
