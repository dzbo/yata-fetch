function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const yata = require('./yata');
const nconf = require('nconf');
const log = require('./log');

module.exports = _asyncToGenerator(function* () {
  // read argv for potential custom config path
  nconf.argv();

  // read ENV for token
  nconf.env();

  // load config path
  nconf.file({ file: yata.getConfigPath(nconf.get('config')) });

  // setup API host
  yata.apiHost = nconf.get('YATA_API_HOST') || 'http://api.yatapp.net/';

  try {
    if (yata.validateConfig(nconf.get('YATA_API_TOKEN'), nconf.get('project'), nconf.get('locales'), nconf.get('format'), nconf.get('root'), nconf.get('outputPath'))) {

      // if passed locale explicit download just one
      if (nconf.get('locale')) {
        yield yata.downloadTranslation(nconf.get('locale'));
      } else {
        for (let locale of yata.locales) {
          yield yata.downloadTranslation(locale);
        }
      }
    }
  } catch (e) {
    log('red', e);
  }
});
//# sourceMappingURL=cli.js.map
