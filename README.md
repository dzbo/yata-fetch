# yata-fetch

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/dzbo/yata-fetch/Test) [![NPM](https://img.shields.io/npm/v/yata-fetch)](https://www.npmjs.com/package/yata-fetch) ![NPM](https://img.shields.io/npm/l/yata-fetch) ![npms.io (maintenance)](https://img.shields.io/npms-io/quality-score/yata-fetch) ![npms.io (maintenance)](https://img.shields.io/npms-io/maintenance-score/yata-fetch)

Welcome to Yata integration package, this package will allow you to easy get your translations from [Yata](https://run.yatapp.net/) service.

## Installation

`yarn add yata-fetch -D`
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
  "strip_empty": true
}
```

- `token` (string, required) - name of ENV variable containing API token
- `project` (string, required) - ID of the project, you can get it from your organization settings in Yata
- `locales` (array, required) - locales to generate
- `format` (string, optional, default: yml) - output file format
- `root` (boolean, optional, default: false) - if set to `true` locale file
  will contain locale as root element
- `outputPath` (string, optional, default: './translations') - path where
  files will be generated
- `strip_empty` (boolean, optional, default: false) - if set to `true` parser will omnit empty keys from generation and export only those that have text

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

and simply call with `yarn yata-fetch` or `npm run yata-fetch`

## Problems?

If you find some problems or bug in the package please open an Issue.

## Collaboration

Want help to develop this package? Please open a Pull Request.

## Package Maintenance

### Installation

```
git clone <this repository>
yarn install
```

### Running Tests

```
yarn test
```

### Building

```
yarn build
```

### Upgrading

```
yarn upgrade-interactive
```

### Release

```
yarn version <major|minor|patch>
git push origin --tags
```

Optionally create new release entry in Github Releases.
When Github Action detect new version there will be automatic release to NPM.

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2017-present, Dominik Zborowski
