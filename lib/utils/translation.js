'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gettext = gettext;
exports.ngettext = ngettext;
exports.gettext_noop = gettext_noop;
exports.pgettext = pgettext;
exports.npgettext = npgettext;
exports.activate = activate;

var _jed = require('jed');

var _jed2 = _interopRequireDefault(_jed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import { global } from '../contexts';

var dictionaries = {};

function gettext(msgid) {
  var currentDictionary = dictionaries[global.language];
  if (currentDictionary) {
    return currentDictionary.gettext(msgid);
  }
  return msgid;
}

function ngettext(singular, plural, count) {
  var currentDictionary = dictionaries[global.language];
  if (currentDictionary) {
    return currentDictionary.ngettext(singular, plural, count);
  }
  return count === 1 ? singular : plural;
}

function gettext_noop(msgid) {
  //eslint-disable-line camelcase
  return msgid;
}

function pgettext(context, msgid) {
  var currentDictionary = dictionaries[global.language];
  if (currentDictionary) {
    return currentDictionary.pgettext(context, msgid);
  }
  return msgid;
}

function npgettext(context, singular, plural, count) {
  var currentDictionary = dictionaries[global.language];
  if (currentDictionary) {
    return currentDictionary.npgettext(context, singular, plural, count);
  }
  return count === 1 ? singular : plural;
}

function activate(language, globalContext) {
  if (!dictionaries[language]) {
    try {
      dictionaries[language] = new _jed2.default(require('__locale_' + language));
    } catch (ex) {
      console.warn('Language with code ' + language + ' is not available');
    }
  }
  globalContext.language = language;
}