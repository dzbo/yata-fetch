module.exports = {
  globals: {
    it: true,
    describe: true,
    afterEach: true,
    beforeEach: true
  },
  rules: {
    'camelcase': 0,

    // JSHint "expr", disabled due to chai expect assertions
    'no-unused-expressions': 0,

    // disabled for easier asserting of file contents
    'quotes': 0,

    // disabled because describe(), it(), etc. should not use arrow functions
    'prefer-arrow-callback': 0
  }
};
