const expect = require('chai').expect;
const yata = require('../../dist/yata');

describe('yata library', function() {

  describe('getConfigPath function', function() {
    it('return default config path', function() {
      expect(yata.getConfigPath()).to.equal('./yata.json');
    });

    it('return custom config path', function() {
      expect(yata.getConfigPath('./custom-yata.json')).to.equal('./custom-yata.json');
    });
  });

  describe('validateConfig function', function() {
    it('return exception if no token in ENV', function() {
      expect(() => {
        yata.validateConfig();
      }).to.throw('token');
    });

    it('return exception if no project', function() {
      expect(() => {
        yata.validateConfig('token');
      }).to.throw('project');
    });

    it('return exception if empty locales', function() {
      expect(() => {
        yata.validateConfig('token', 'project', []);
      }).to.throw('locales');
    });

    it('return exception if no locales', function() {
      expect(() => {
        yata.validateConfig('token', 'project');
      }).to.throw('locales');
    });

    it('return exception if locales as string', function() {
      expect(() => {
        yata.validateConfig('token', 'project', 'pl_PL');
      }).to.throw('locales');
    });

    it('passes validaiton when using only required params', function() {
      const validation = yata.validateConfig('token', 'project', ['pl_PL']);

      expect(validation).to.be.true;
      expect(yata.format).to.equal('yml');
      expect(yata.root).to.be.false;
      expect(yata.outputPath).to.be.equal('translations');
    });

    it('passes validaiton when passing all params', function() {
      const validation = yata.validateConfig('token', 'project', ['pl_PL'], 'json', true, 'locales');

      expect(validation).to.be.true;
      expect(yata.token).to.equal('token');
      expect(yata.project).to.equal('project');
      expect(yata.locales).to.deep.equal(['pl_PL']);
      expect(yata.format).to.equal('json');
      expect(yata.root).to.be.true;
      expect(yata.outputPath).to.be.equal('locales');
    });
  });

  describe('downloadTranslation function', function() {
    it('throw exception if no locale', function() {
      expect(() => yata.downloadTranslation()).to.throw('locale');
    });
  });

  describe('normalizeLocale function', function() {
    it('work with undefined value', function() {
      expect(() => yata.normalizeLocale()).to.not.throw();
    });

    it('work with null value', function() {
      expect(() => yata.normalizeLocale(null)).to.not.throw();
    });

    it('work with empty string value', function() {
      expect(yata.normalizeLocale('')).to.equal();
    });


    it('work ISO notation', function() {
      expect(yata.normalizeLocale('en-us')).to.equal('en_US');
    });

    it('work with simple notation', function() {
      expect(yata.normalizeLocale('EN')).to.equal('en');
    });

    it('work with already correct version', function() {
      expect(yata.normalizeLocale('en_US')).to.equal('en_US');
    });
  });
});
