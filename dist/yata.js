"use strict";

var https = require("https");

var fs = require("fs");

var path = require("path");

var log = require("./log");

module.exports = {
  config: null,
  defaultConfigPath: "./yata.json",
  configPath: null,
  token: null,
  project: null,
  locales: [],
  format: "yml",
  root: false,
  outputPath: "translations",
  stripEmpty: false,
  apiHost: null,
  getConfigPath: function getConfigPath(configPath) {
    if (configPath) {
      this.configPath = configPath;
    } else {
      this.configPath = this.defaultConfigPath;
    }

    return this.configPath;
  },
  validateConfig: function validateConfig(token, project, locales, format, root, outputPath, stripEmpty) {
    if (!token) {
      throw new Error("No `token` in ENV");
    } else {
      this.token = token;
    }

    if (!project) {
      throw new Error("No `project` in config file");
    } else {
      this.project = project;
    }

    if (!Array.isArray(locales) || locales.length === 0) {
      throw new Error("No `locales` in config file");
    } else {
      this.locales = locales;
    }

    if (format && typeof format === "string") {
      this.format = format;
    }

    if (root && typeof root === "boolean") {
      this.root = root;
    }

    if (outputPath && typeof outputPath === "string") {
      this.outputPath = outputPath;
    }

    if (stripEmpty && typeof stripEmpty === "boolean") {
      this.stripEmpty = stripEmpty;
    }

    return true;
  },
  normalizeLocale: function normalizeLocale(locale) {
    if (!locale) {
      return;
    }

    var localeSegments = locale.replace("-", "_").split("_");
    var newLocale = [];
    newLocale.push(localeSegments[0].toLowerCase()); // two segment locale

    if (localeSegments[1]) {
      newLocale.push(localeSegments[1].toUpperCase());
    }

    return newLocale.join("_");
  },
  downloadTranslation: function downloadTranslation(locale) {
    var normalizedLocale = this.normalizeLocale(locale);

    if (!normalizedLocale) {
      throw new Error("No locale passed to download function");
    } // if output folder doesn't exist we create it


    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath);
    }

    var fileName = "".concat(normalizedLocale, ".").concat(this.format);
    var filePath = path.join(process.cwd(), "".concat(this.outputPath, "/").concat(fileName));
    var url = "".concat(this.apiHost, "/api/v1/project/").concat(this.project, "/").concat(locale, "/").concat(this.format, "?apiToken=").concat(this.token, "&root=").concat(this.root, "&strip_empty=").concat(this.stripEmpty);
    var bufferFile; // if file exist we grab it's size

    if (fs.existsSync(filePath)) {
      bufferFile = fs.readFileSync(filePath);
    } // we start stream


    var file = fs.createWriteStream(filePath);
    return new Promise(function (resolve, reject) {
      https.get(url, function (response) {
        var statusCode = response.statusCode;

        if (statusCode !== 200) {
          return reject("Request Failed.\nStatus Code: ".concat(statusCode));
        }

        response.pipe(file);
        file.on("finish", function () {
          var newBufferFile = fs.readFileSync(filePath);

          if (bufferFile && bufferFile.equals(newBufferFile)) {
            log("yellow", "Generating \"".concat(locale, "\" translation. Skipped."));
          } else {
            log("green", "Generating \"".concat(locale, "\" translation. Done."));
          }

          resolve();
        });
      }).on("error", function (e) {
        log("red", e);
      });
    });
  }
};
//# sourceMappingURL=yata.js.map
