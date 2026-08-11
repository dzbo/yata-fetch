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
pnpm vitest run test/unit/config.spec.ts
```

## Architecture

Five focused modules, no shared mutable state:

- **`src/cli.ts`** — entry point. Parses argv, reads the JSON config file, calls `loadConfig()`, then downloads every locale via `Promise.allSettled`. Owns `process.exitCode` — 1 if any locale failed.
- **`src/config.ts`** — `loadConfig()` merges argv → env → file, validates, and returns an immutable `Config`. Also warns on unknown and deprecated keys. `parseArgv()` handles `--key value` and `--key=value`.
- **`src/download.ts`** — `downloadTranslation(config, locale, deps?, apiHost?)`. Fetches via native `fetch`, writes to a `.tmp` path, then renames — so a failure never truncates an existing file.
- **`src/locale.ts`** — `normalizeLocale()` (`en-US` → `en_US`). Throws on blank input.
- **`src/log.ts`** — colored console output (red/green/yellow ANSI codes).
- **`src/types.ts`** — shared `Config`, `Format`, `Deps`, `DownloadResult`. Type-only, so it is excluded from coverage.

`Config` is an immutable value object passed explicitly into `downloadTranslation` — deliberately not a mutable singleton, which is what v2 had and what made its tests order-dependent.

`downloadTranslation` takes its network and filesystem functions as an optional `deps` parameter (defaulting to the real ones). Tests pass fakes from `test/helpers/fakes.ts`, which is how every error branch is reachable without module mocking.

Build target is CJS (`dist/cli.cjs`) via Vite. The `bin/yata-fetch.js` entry is ESM (the package is `"type": "module"`) and imports that CJS build through default interop.

## Testing

Coverage thresholds are set to **100%** for lines/branches/functions/statements in `vite.config.ts`, so CI fails if coverage regresses. Run `pnpm coverage` before opening a PR.

If a branch is genuinely unreachable, prefer restructuring the code to remove it over adding an ignore comment. Do not lower the thresholds.

## Comments

- **`/** ... */` for what a function is** — a one-line summary on exported functions whose purpose isn't obvious from the signature. See `redactUrl` in `src/download.ts` and `parseArgv` in `src/config.ts`.
- **`//` for why a line is the way it is** — non-obvious reasoning only. See the tmp-then-rename note in `src/download.ts`.
- **No `@param` / `@returns` tags.** The TypeScript signatures already carry that information, so tags duplicate it and rot. Nothing generates docs from this package.
- **Exception — `bin/yata-fetch.js`** uses a JSDoc `@type` annotation because it is `.js` and cannot use TS syntax. That is type annotation doing real work, not documentation.

Don't add comments that restate the code. If a comment is needed to explain _what_ a block does, prefer renaming or extracting a function.

## Key design detail

The `token` field in the JSON config is **the name of an environment variable**, not the token itself. For example `"token": "MY_YATA_API_TOKEN"` means the CLI reads `process.env.MY_YATA_API_TOKEN` at runtime. This indirection is intentional so tokens are never stored in config files.

## Release process

`pnpm release` runs `scripts/release.sh`: bumps `package.json` version, commits, pushes, creates a git tag, and pushes the tag. GitHub Actions detects the tag and publishes to npm automatically. Do not manually publish.

The script accepts an optional release type argument (`bash scripts/release.sh patch|minor|major`) and prompts interactively when omitted. The `/release` slash command (`.claude/commands/release.md`) uses this to fully automate releases: it inspects commits since the last tag, picks the bump type via Conventional Commits rules (`feat:` → minor, `BREAKING CHANGE`/`!:` → major, otherwise patch), and runs the script non-interactively.

## Commit & PR conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) prefixes (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, etc.) for commit messages and PR titles.

## Git workflow

- Never commit directly to `main` — work on a branch and open a PR.
- Branch naming: `<type>/<description>` (e.g. `fix/publish-command`, `chore/upgrade-all-packages`), matching the commit type prefixes above.
- A husky `pre-commit` hook runs `lint-staged` (eslint on staged `.ts` files, prettier on all staged files) before every commit — see `.husky/pre-commit` and the `lint-staged` field in `package.json`.

## Things to get right

- Despite `"type": "module"` in `package.json`, the build output is CJS (`dist/cli.cjs`) — this is intentional. Don't switch it to ESM output.
- `bin/yata-fetch.js` is ESM (the package is `"type": "module"`, so a `.js` file cannot use `require`) and imports the CJS build via default interop. It stays `.js` because Node executes it directly via shebang.
- The `token` config field is an env var _name_, not the secret itself (see Key design detail above) — never treat it as a literal token value.
- CI publishes to npm automatically from pushed version tags. Never run `npm publish` manually.
- `typescript` is pinned to an exact version (no `^`) on purpose. `typescript-eslint` declares `typescript@>=4.8.4 <6.1.0` and **hard-errors** on TS 7.0 — eslint fails to load its config entirely, so linting breaks. Upstream tracks TS >=7.1 support in [typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940). Don't loosen the pin until that lands.
