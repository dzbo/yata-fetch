# yata-fetch

CLI tool that downloads translation files from the [Yatapp](https://run.yatapp.net/) service.
Published to npm and consumed by other projects as a dev dependency. TypeScript, built with
Vite to a CJS bundle, tested with vitest.

## Hard rules

1. Never commit directly to `main` — work on a `<type>/<description>` branch (e.g. `fix/publish-command`) and open a PR.
2. Commit messages and PR titles use [Conventional Commits](https://www.conventionalcommits.org/) prefixes (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, …).
3. Coverage stays at **100%** for lines/branches/functions/statements (`vite.config.ts`, enforced in CI). Never lower the thresholds; if a branch is unreachable, restructure the code instead of adding an ignore comment.
4. Never run `npm publish` by hand — CI publishes from pushed version tags; release through `pnpm release` or `/release`.

## Domain rules

- **Build output is CJS** (`dist/cli.cjs`) despite `"type": "module"` in `package.json`. This is intentional; don't switch it to ESM.
- **`bin/yata-fetch.js` is ESM** (a `.js` file in a `"type": "module"` package cannot use `require`) and imports the CJS build via default interop. It stays `.js` because Node executes it directly via shebang.
- **The `token` config field is an env var _name_**, not the secret. `"token": "MY_YATA_API_TOKEN"` means the CLI reads `process.env.MY_YATA_API_TOKEN` at runtime, so tokens are never stored in config files.
- **`typescript` is pinned to an exact version** (no `^`). `typescript-eslint` declares `typescript@>=4.8.4 <6.1.0` and hard-errors on TS 7.0, so eslint fails to load its config. Upstream tracks TS >=7.1 support in [typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940). Don't loosen the pin until that lands.

## Local development

```bash
pnpm install        # install dependencies
pnpm build          # compile TypeScript → dist/cli.cjs via Vite
pnpm test           # run tests with vitest
pnpm coverage       # run tests with coverage report (run before opening a PR)
pnpm lint           # eslint + tsc type-check + prettier in parallel
pnpm vitest run test/unit/config.spec.ts   # a single test file
```

A husky `pre-commit` hook runs `lint-staged` (eslint on staged `.ts` files, prettier on all
staged files) — see `.husky/pre-commit` and the `lint-staged` field in `package.json`.

## Architecture

Five focused modules, no shared mutable state:

- **`src/cli.ts`** — entry point. Parses argv, reads the JSON config file, calls `loadConfig()`, then downloads every locale via `Promise.allSettled`. Owns `process.exitCode` — 1 if any locale failed.
- **`src/config.ts`** — `loadConfig()` merges argv → env → file, validates, and returns an immutable `Config`. Warns on unknown and deprecated keys. `parseArgv()` handles `--key value` and `--key=value`.
- **`src/download.ts`** — `downloadTranslation(config, locale, deps?, apiHost?)`. Fetches via native `fetch`, writes to a `.tmp` path, then renames — so a failure never truncates an existing file.
- **`src/locale.ts`** — `normalizeLocale()` (`en-US` → `en_US`). Throws on blank input.
- **`src/log.ts`** — colored console output (red/green/yellow ANSI codes).
- **`src/types.ts`** — shared `Config`, `Format`, `Deps`, `DownloadResult`. Type-only, so excluded from coverage.

`Config` is an immutable value object passed explicitly into `downloadTranslation` — deliberately
not a mutable singleton, which is what v2 had and what made its tests order-dependent.

`downloadTranslation` takes its network and filesystem functions as an optional `deps` parameter
(defaulting to the real ones). Tests pass fakes from `test/helpers/fakes.ts`, which is how every
error branch is reachable without module mocking.

## Comments

- **`/** ... */` for what a function is** — a one-line summary on exported functions whose purpose isn't obvious from the signature (see `redactUrl` in `src/download.ts`, `parseArgv` in `src/config.ts`).
- **`//` for why a line is the way it is** — non-obvious reasoning only (see the tmp-then-rename note in `src/download.ts`).
- **No `@param` / `@returns` tags.** The TypeScript signatures already carry that information; nothing generates docs from this package.
- **Exception — `bin/yata-fetch.js`** uses a JSDoc `@type` annotation because it is `.js` and cannot use TS syntax.

Don't add comments that restate the code. If a block needs a comment to explain _what_ it does,
prefer renaming or extracting a function.

## Release process

`pnpm release` runs `scripts/release.sh`: bumps the `package.json` version, commits, pushes,
creates a git tag and pushes it. GitHub Actions detects the tag and publishes to npm.

The script accepts an optional release type (`bash scripts/release.sh patch|minor|major`) and
prompts when omitted. The `/release` slash command (`.claude/commands/release.md`) inspects
commits since the last tag, picks the bump via Conventional Commits rules (`feat:` → minor,
`BREAKING CHANGE`/`!:` → major, otherwise patch), and runs the script non-interactively.

## Index

`.agent-context/` holds conventions, prompts and references loaded on demand; it is empty for now.
