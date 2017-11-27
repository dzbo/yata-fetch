# yata-fetch

[![CircleCI](https://circleci.com/gh/dzbo/yata-fetch/tree/master.svg?style=svg)](https://circleci.com/gh/dzbo/yata-fetch/tree/master)

Adds CLI interface for importing translation files (yml, json etc.) from [Yata](http://www.yatapp.net/).

## Installation

Simply install via [yarn](https://yarnpkg.com) package manager:

`yarn add yata-fetch`

## Usage

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

### Config file

Example `yata.json` file should look like this:

```
{
  "project": "1",
  "locales": [
    "en_US", "de_DE"
  ],
  "format": "yml",
  "root": false,
  "outputPath": "./translations"
}
```

* `project` (string, required) - ID of the project
* `locales` (array, required) - locales to generate
* `format` (string, optional, default: yml) - output file format
* `root` (boolean, optional, default: false) - if set to `true` locale file
  will contain locale as root element
* `outputPath` (string, optional, default: './translations') - path where
  files will be generated

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
