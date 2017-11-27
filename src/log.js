
module.exports = function(color, message) {
  let code;

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
      code = '\x1b[37m'; // white
  }

  return console.log(`${code}%s\x1b[0m`, message);
};
