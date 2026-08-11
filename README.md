# yata-fetch

[![NPM](https://img.shields.io/npm/v/yata-fetch)](https://www.npmjs.com/package/yata-fetch) ![NPM](https://img.shields.io/npm/l/yata-fetch) ![npms.io (maintenance)](https://img.shields.io/npms-io/quality-score/yata-fetch) ![npms.io (maintenance)](https://img.shields.io/npms-io/maintenance-score/yata-fetch)

Welcome to Yata integration package, this package will allow you to easy get your translations from [Yata](https://run.yatapp.net/) service.

## Installation

`pnpm add yata-fetch -D`
`npm install yata-fetch -D`

## Usage

### Setup

- Create config file in project folder (see details below).
- Add `MY_YATA_API_TOKEN` key to env variables in `.zshrc/.bashrc`:

```
export MY_YATA_API_TOKEN=XXXX
```

You can check token in your organization settings.

### Configuration file

Example `.yata.json` file:

```json
{
  "token": "MY_YATA_API_TOKEN",
  "project": "XXX",
  "locales": ["en_US", "de_DE"],
  "format": "yml",
  "root": false,
  "outputPath": "./translations",
  "stripEmpty": true
}
```

- `token` (string, required) - name of ENV variable containing API token
- `project` (string, required) - ID of the project, you can get it from your organization settings in Yata
- `locales` (array of strings, required) - locales to generate
- `format` (string, optional, default: yml) - output file format, either `yml` or `json`
- `root` (boolean, optional, default: false) - if set to `true` locale file
  will contain locale as root element
- `outputPath` (string, optional, default: 'translations') - path where
  files will be generated, created recursively if missing
- `stripEmpty` (boolean, optional, default: false) - if set to `true` parser will omit empty keys from generation and export only those that have text

Unknown keys are reported with a suggested correction, so a typo like
`outputpath` is caught instead of being silently ignored.

### Fetching translations

```
$ yata-fetch [options]
```

Options:

- `config` (string, optional, default: yata.json) - path to json config file.
- `locale` - if you like you can generate only one locale instead whole stack from config file

Example:

```
$ yata-fetch --config .yata.json --locale en_US
```

It's recommended to create scripts for generating translations in `package.json` file. For example:

```json
"scripts": {
  "yata-fetch": "yata-fetch --config .yata.json"
  "yata-fetch:en": "yata-fetch --config .yata.json --locale en_US"
}
```

and simply call with `pnpm yata-fetch` or `npm run yata-fetch`

## Upgrading from v2 to v3

- **Node 24+ is required** (was 22).
- **`strip_empty` is now `stripEmpty`.** The old key still works but prints a
  deprecation warning; it will be removed in v4.
- **A failed download now exits with code 1.** Previously every failure exited
  0, so a broken token or wrong project id silently "passed" in CI. If a build
  starts failing after upgrading, it was already failing — it just wasn't
  reported.
- **A failed download no longer damages existing files.** v2 truncated the
  target file before making the request; v3 writes to a temporary file and
  renames it on success.
- **`format` is validated** against `yml` and `json`. A typo is now a clear
  config error instead of a confusing API failure.
- **Unknown config keys print a warning** with a suggested correction.
- **`outputPath` is created recursively**, so nested paths like
  `src/locales/generated` work.
- **Zero runtime dependencies** — `nconf` was removed.

CLI flags are unchanged: `--config` and `--locale` work exactly as before.

## Problems?

If you find some problems or bug in the package please open an Issue.

## Collaboration

Want help to develop this package? Please open a Pull Request.

## Package Maintenance

### Installation

```bash
git clone <this repository>
pnpm install
```

### Running Tests

```bash
pnpm test
```

### Building

```bash
pnpm build
```

### Upgrading

```bash
pnpm update --interactive
```

### Release

Run the interactive release script:

```bash
pnpm release
```

It will ask whether this is a `patch`, `minor`, or `major` release, bump the version in `package.json`, create a git tag, and push it. GitHub Actions will automatically publish to npm when the tag is detected.

Publishing credentials live in the `NPM_TOKEN` repository secret (Settings → Secrets and variables → Actions), which [`.github/workflows/publish.yaml`](.github/workflows/publish.yaml) writes into a temporary `.npmrc` on the runner. The token is never stored locally — your own `.npmrc` needs no auth entry to develop on this project.

To rotate it, generate a new automation token at [npmjs.com/settings/dzbo/tokens](https://www.npmjs.com/settings/dzbo/tokens) and update the repository secret. An expired token surfaces as an `E401` failure in the publish workflow.

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2017-present, Dominik Zborowski
