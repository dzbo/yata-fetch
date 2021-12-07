"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var yata = require("./yata");

var nconf = require("nconf");

var log = require("./log");

require("dotenv").config();

module.exports = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  var _iterator, _step, locale;

  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // read argv for potential custom config path
          nconf.argv(); // read ENV for token

          nconf.env(); // load config path

          nconf.file({
            file: yata.getConfigPath(nconf.get("config"))
          }); // setup API host

          yata.apiHost = nconf.get("YATA_API_HOST") || "https://api.yatapp.net";
          _context.prev = 4;

          if (!yata.validateConfig(nconf.get(nconf.get("token")), nconf.get("project"), nconf.get("locales"), nconf.get("format"), nconf.get("root"), nconf.get("outputPath"), nconf.get("strip_empty"))) {
            _context.next = 28;
            break;
          }

          if (!nconf.get("locale")) {
            _context.next = 11;
            break;
          }

          _context.next = 9;
          return yata.downloadTranslation(nconf.get("locale"));

        case 9:
          _context.next = 28;
          break;

        case 11:
          _iterator = _createForOfIteratorHelper(yata.locales);
          _context.prev = 12;

          _iterator.s();

        case 14:
          if ((_step = _iterator.n()).done) {
            _context.next = 20;
            break;
          }

          locale = _step.value;
          _context.next = 18;
          return yata.downloadTranslation(locale);

        case 18:
          _context.next = 14;
          break;

        case 20:
          _context.next = 25;
          break;

        case 22:
          _context.prev = 22;
          _context.t0 = _context["catch"](12);

          _iterator.e(_context.t0);

        case 25:
          _context.prev = 25;

          _iterator.f();

          return _context.finish(25);

        case 28:
          _context.next = 33;
          break;

        case 30:
          _context.prev = 30;
          _context.t1 = _context["catch"](4);
          log("red", _context.t1);

        case 33:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, null, [[4, 30], [12, 22, 25, 28]]);
}));
//# sourceMappingURL=cli.js.map
