---
name: steward
description: Repo-specific conventions for a Claude session driving a tankerkoenig-card PR to green (CI, review comments, merges).
---

# Stewarding PRs in tankerkoenig-card

This repo is a single-file Home Assistant Lovelace card (`tankerkoenig-card.js`,
a browser ES module loaded straight from Home Assistant's `www/` folder via
CDN imports of `lit-element`/`lit-html`). There is no `package.json`, no
bundler, and no automated test suite — keep that in mind when validating
changes.

## Validating a change before pushing

- **Syntax check the card file:** `node --check tankerkoenig-card.js`. This
  only checks JS syntax (Node can't actually run the file — it imports
  `lit-element`/`lit-html` from `https://unpkg.com/...` — but it catches
  typos, unbalanced braces, and similar mistakes immediately).
- **Validate `hacs.json`** stays valid JSON:
  `node -e "JSON.parse(require('fs').readFileSync('hacs.json', 'utf8'))"`.
- There is no way to functionally exercise the card outside a real Home
  Assistant Lovelace dashboard in this session. Say so explicitly in the PR
  rather than claiming the feature itself was verified — CI here only proves
  the file is syntactically valid, not that the UI behaves correctly.
- `.github/workflows/ci.yml` runs both checks above on every `pull_request`
  and `push` to `master`. Treat a red run here as a real problem to fix, not
  a flake — the checks are deterministic (syntax + JSON parsing).

## CodeQL can go quiet

`.github/workflows/codeql.yml` also runs on PRs to `master`, but it carries
a `schedule` trigger, which makes GitHub auto-disable the *entire* workflow
after ~60 days of repository inactivity (this has happened before). If a PR
shows zero check runs at all (not even queued), check whether workflows are
disabled under the repo's Settings → Actions → Workflows — GitHub does not
expose a way to re-enable a disabled workflow through the API used here, so
flag it to a repo admin (the "Enable workflow" button in that UI) rather
than trying to work around it with an empty commit or workflow_dispatch.

## Merge conventions

- History on `master` uses merge commits for PRs (see `git log --merges`),
  not squash or rebase — follow that when resolving a merge conflict on a
  branch you created.
- Releases are fully automated: `.github/workflows/release.yml` tags and
  publishes a new patch version on every PR merge into `master`. Never
  hand-edit version tags or the version badge in `README.md` as part of a
  fix — that's not this repo's convention and will conflict with the
  automation.

## Scope

This card has no config schema validation beyond what's in
`tankerkoenig-card.js` (`validateConfig`) — when reviewing config-shaped
changes, check that class stays in sync with `README.md`'s documented
options and with the visual editor (`TankerkoenigCardEditor`) in the same
file, since all three tend to drift independently.
