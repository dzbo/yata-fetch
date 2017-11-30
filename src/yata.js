const http = require('http');
const fs = require('fs');
const path = require('path');
const log = require('./log');

module.exports = {
  config:            null,
  defaultConfigPath: './yata.json',
  configPath:        null,
  token:             null,
  project:           null,
  locales:           [],
  format:            'yml',
  root:              false,
  outputPath:        'translations',
  apiHost:           null,

  getConfigPath(configPath) {
    if (configPath) {
      this.configPath = configPath;
    } else {
      this.configPath = this.defaultConfigPath;
    }

    return this.configPath;
  },

  validateConfig(token, project, locales, format, root, outputPath) {
    if (!token) {
      throw new Error('No `token` in ENV');
    } else {
      this.token = token;
    }

    if (!project) {
      throw new Error('No `project` in config file');
    } else {
      this.project = project;
    }

    if (!Array.isArray(locales) || locales.length === 0) {
      throw new Error('No `locales` in config file');
    } else {
      this.locales = locales;
    }

    if (format && typeof format === 'string') {
      this.format = format;
    }

    if (root && typeof root === 'boolean') {
      this.root = root;
    }

    if (outputPath && typeof outputPath === 'string') {
      this.outputPath = outputPath;
    }

    return true;
  },

  normalizeLocale(locale) {
    if (!locale) { return; }

    return locale.toLowerCase().replace('_', '-');
  },

  downloadTranslation(locale) {
    const normalizedLocale = this.normalizeLocale(locale);

    if (!normalizedLocale) { throw new Error('No locale passed to download function'); }

    // if output folder doesn't exist we create it
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath);
    }

    const fileName = `${normalizedLocale}.${this.format}`;
    const filePath = path.join(process.cwd(), `${this.outputPath}/${fileName}`);
    const url = `${this.apiHost}/api/v1/project/${this.project}/${locale}/${this.format}?apiToken=${this.token}&root=${this.root}`;

    let bufferFile;

    // if file exist we grab it's size
    if (fs.existsSync(filePath)) {
      bufferFile = fs.readFileSync(filePath);
    }

    // we start stream
    const file = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      http.get(url, response => {
        const { statusCode } = response;

        if (statusCode !== 200) {
          return reject(`Request Failed.\nStatus Code: ${statusCode}`);
        }

        response.pipe(file);
        file.on('finish', () => {
          const newBufferFile = fs.readFileSync(filePath);

          if (bufferFile.equals(newBufferFile)) {
            log('yellow', `Generating "${locale}" translation. Skipped.`);
          } else {
            log('green', `Generating "${locale}" translation. Done.`);
          }
          resolve();
        });
      }).on('error', e => {
        log('red', e);
      });
    });
  }
};
