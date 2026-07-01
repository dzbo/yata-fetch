# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`yata-fetch` is a CLI tool that downloads translation files from the [Yatapp](https://run.yatapp.net/) service. It's published to npm and consumed by other projects as a dev dependency.

## Commands

```bash
pnpm install        # install dependencies
pnpm build          # compile TypeScript → dist/cli.cjs via Vite
pnpm test           # run tests with vitest
pnpm coverage       # run tests with coverage report
pnpm lint           # run eslint + tsc type-check + prettier in parallel
pnpm release        # interactive release: bumps version, commits, tags, pushes (CI publishes to npm)
/release            # (Claude Code) auto-detects bump type from commits since last tag, runs release non-interactively
```

Run a single test file:

```bash
pnpm vitest run src/path/to/file.test.ts
```

## Architecture

The tool has three source files:

- **`src/cli.ts`** — entry point. Reads config via `nconf` in priority order: CLI argv → environment variables → JSON config file. Validates config then calls `yata.downloadTranslation()` for each locale.
- **`src/yata.ts`** — core module (exported as a singleton object). Handles config validation, locale normalization (`en-US` → `en_US`), and downloads translation files via HTTPS streaming to the output path.
- **`src/log.ts`** — colored console output (red/green/yellow ANSI codes).

Build target is CJS (`dist/cli.cjs`) via Vite. The `bin/yata-fetch.js` shell entry requires this compiled output.

## Key design detail

The `token` field in the JSON config is **the name of an environment variable**, not the token itself. For example `"token": "MY_YATA_API_TOKEN"` means the CLI reads `process.env.MY_YATA_API_TOKEN` at runtime. This indirection is intentional so tokens are never stored in config files.

## Release process

`pnpm release` runs `scripts/release.sh`: bumps `package.json` version, commits, pushes, creates a git tag, and pushes the tag. GitHub Actions detects the tag and publishes to npm automatically. Do not manually publish.

The script accepts an optional release type argument (`bash scripts/release.sh patch|minor|major`) and prompts interactively when omitted. The `/release` slash command (`.claude/commands/release.md`) uses this to fully automate releases: it inspects commits since the last tag, picks the bump type via Conventional Commits rules (`feat:` → minor, `BREAKING CHANGE`/`!:` → major, otherwise patch), and runs the script non-interactively.

## Commit & PR conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) prefixes (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, etc.) for commit messages and PR titles.

## Git workflow

- Never commit directly to `master` — work on a branch and open a PR.
- Branch naming: `<type>/<description>` (e.g. `fix/publish-command`, `chore/upgrade-all-packages`), matching the commit type prefixes above.
- A husky `pre-commit` hook runs `lint-staged` (eslint on staged `.ts` files, prettier on all staged files) before every commit — see `.husky/pre-commit` and the `lint-staged` field in `package.json`.

## Things to get right

- Despite `"type": "module"` in `package.json`, the build output is CJS (`dist/cli.cjs`) — this is intentional for `require()`-based CLI consumption via `bin/yata-fetch.js`. Don't switch it to ESM output.
- The `token` config field is an env var _name_, not the secret itself (see Key design detail above) — never treat it as a literal token value.
- CI publishes to npm automatically from pushed version tags. Never run `npm publish` manually.
