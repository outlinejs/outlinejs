'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.vsprintf = exports.sprintf = undefined;

var _sprintfJs = require('sprintf-js');

var _sprintfJs2 = _interopRequireDefault(_sprintfJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sprintf = exports.sprintf = _sprintfJs2.default.sprintf;
var vsprintf = exports.vsprintf = _sprintfJs2.default.vsprintf;