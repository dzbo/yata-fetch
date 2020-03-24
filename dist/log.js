"use strict";

module.exports = function (color, message) {
  var code;

  switch (color) {
    case 'red':
      code = '\x1b[31m';
      break;

    case 'green':
      code = '\x1b[32m';
      break;

    case 'yellow':
      code = '\x1b[33m';
      break;

    default:
      code = '\x1b[37m';
    // white
  }

  return console.log("".concat(code, "%s\x1B[0m"), message);
};
//# sourceMappingURL=log.js.map
