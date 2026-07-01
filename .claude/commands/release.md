---
description: Auto-detect bump type from commits and run the release (bump, commit, tag, push)
---

Run a fully automated release — no interactive prompts.

1. Confirm the working tree is clean (`git status --short`). If there are uncommitted changes, stop and ask the user before continuing.
2. Find commits since the last tag: `git log $(git describe --tags --abbrev=0)..HEAD --oneline`.
3. Determine the release type from those commit messages using Conventional Commits rules:
   - `major` if any commit contains `BREAKING CHANGE` or has a `!:` after the type (e.g. `feat!:`, `fix!:`)
   - `minor` if any commit starts with `feat:` / `feat(...):`
   - `patch` otherwise (covers `fix:`, `chore:`, everything else) — this is the safe default
4. Tell the user which type was detected and why (briefly).
5. Run `bash scripts/release.sh <type>` (the script now accepts the type as `$1` and skips its interactive prompt when provided).
6. Report the new version and that CI will publish to npm from the pushed tag — do not run `npm publish` manually.

If there are no commits since the last tag, stop and tell the user there's nothing to release.
