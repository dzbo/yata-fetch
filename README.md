# yata-fetch

[![CircleCI](https://circleci.com/gh/dzbo/yata-fetch/tree/master.svg?style=svg)](https://circleci.com/gh/dzbo/yata-fetch/tree/master)

Welcome to Yata integration package, this package will allow you to easy get your translations from http://yatapp.net service.

## Installation

Simply install via [yarn](https://yarnpkg.com) package manager:

`yarn add yata-fetch -D`

## Usage

### Setup

* Create config file in project folder (see details below).
* Add `MY_YATA_API_TOKEN` key to env variables in `.zshrc/.bashrc`:

```
export MY_YATA_API_TOKEN=XXXX
```

You can check token in your organization settings.


### Configuration file

Example `yata.json` file:

```
{
  "token": "MY_YATA_API_TOKEN",
  "project": "1",
  "locales": [
    "en_US", "de_DE"
  ],
  "format": "yml",
  "root": false,
  "outputPath": "./translations",
  "strip_empty": true
}
```

* `token` (string, required) - name of ENV variable containing API token
* `project` (string, required) - ID of the project
* `locales` (array, required) - locales to generate
* `format` (string, optional, default: yml) - output file format
* `root` (boolean, optional, default: false) - if set to `true` locale file
  will contain locale as root element
* `outputPath` (string, optional, default: './translations') - path where
  files will be generated
* `strip_empty` (boolean, optional, default: false) - if set to `true` parser will omnit empty keys from generation and export only those that have text

### Fetching translations

```
$ node_modules/.bin/yata-fetch [options]
```

Options:

* `config` (string, optional, default: yata.json) - path to json config file.
* `locale` - if you like you can generate only one locale instead whole
  stack from config file


Example:

```
node_modules/.bin/yata-fetch --config config.json --locale en_US
```

## Problems?

* Open an Issue

## Contributing

This project uses `yarn` as a package manager and `gulp` as task runner.

## Package Maintenance

### Installation

* `git clone` this repository
* `yarn install`

### Running

* `yarn s`

#### Running Tests

* `yarn test`

### Building

* `yarn build`

Build files are storred in `dist` folder.
