# Dependabot maintenance

As of **2026-07-24**, production WordPress is **6.7.4**.

Dependabot opens pull requests when npm or Composer dependencies can be updated, and (when security updates are enabled) when a known vulnerability has a fix. Version-update behaviour is configured in [`.github/dependabot.yml`](../.github/dependabot.yml). Security-fix PRs are a separate GitHub setting — confirm it is on for this repo under [Settings → Code security](https://github.com/bcgov/bcew-monorepo/settings/security_analysis) (**Dependabot security updates**).

It keeps up to **3 open PRs per ecosystem** (npm and Composer). When you merge or close one, Dependabot can open the next. Reviewers are `@bcgov/digital-engagement-solutions-custom-web` (first available).

## WordPress and Dependabot

Production runs **WordPress 6.7.4**. Shared `@wordpress/*` package versions are pinned in [`pnpm-workspace.yaml`](../pnpm-workspace.yaml) (`catalog:` entries use `wp-6.7` tags). Those packages must stay compatible with that core.

Dependabot may open a PR that bumps a catalog package (or another dependency) to a version built for a newer WordPress. Merging that would put the monorepo on packages that do not match the core we run. If CI fails for that reason, or the package changelog/release notes require a newer WordPress, defer the update.

## Handling PRs

1. Open Dependabot PRs (`author:dependabot`) and [security alerts](https://github.com/bcgov/bcew-monorepo/security/dependabot). Do critical/high security first.
2. CI green and compatible with WP 6.7.4 → merge.
3. CI red, or the bump needs a newer WordPress → defer.

## Can't merge? Defer

1. Close the PR.
2. Open an issue (what failed, why, what unblocks it). Example:

   ```text
   Dependabot deferred: @wordpress/block-editor

   Dependabot tried to bump to v14.0.0 but this requires WordPress 6.8+.
   Production is on 6.7.4.

   Unblocks when: production WordPress upgrades to 6.8.
   ```

3. Add an `ignore` in `.github/dependabot.yml`:

```yaml
ignore:
  - dependency-name: "@wordpress/block-editor"
    # Deferred: #123 — needs WP 6.8, production is 6.7.4
    versions: ["14.0.0"]
```

4. When the issue can be resolved, resolve it, remove that `ignore`, then close the issue.

See also: [Package management](./package-management.md), [CI/CD](./ci-cd.md).
