'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _jed = require('jed');

var _jed2 = _interopRequireDefault(_jed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dictionaries = {};

var _class = function () {
  function _class() {
    _classCallCheck(this, _class);

    this._language = null;
  }

  _createClass(_class, [{
    key: 'gettext',
    value: function gettext(msgid) {
      var currentDictionary = dictionaries[this._language];
      if (currentDictionary) {
        return currentDictionary.gettext(msgid);
      }
      return msgid;
    }
  }, {
    key: 'ngettext',
    value: function ngettext(singular, plural, count) {
      var currentDictionary = dictionaries[this._language];
      if (currentDictionary) {
        return currentDictionary.ngettext(singular, plural, count);
      }
      return count === 1 ? singular : plural;
    }
  }, {
    key: 'gettext_noop',
    value: function gettext_noop(msgid) {
      //eslint-disable-line camelcase
      return msgid;
    }
  }, {
    key: 'pgettext',
    value: function pgettext(context, msgid) {
      var currentDictionary = dictionaries[this._language];
      if (currentDictionary) {
        return currentDictionary.pgettext(context, msgid);
      }
      return msgid;
    }
  }, {
    key: 'npgettext',
    value: function npgettext(context, singular, plural, count) {
      var currentDictionary = dictionaries[this._language];
      if (currentDictionary) {
        return currentDictionary.npgettext(context, singular, plural, count);
      }
      return count === 1 ? singular : plural;
    }
  }, {
    key: 'language',
    get: function get() {
      return this._language;
    },
    set: function set(value) {
      // patch language value with _ (separator used by gettext)
      // instead of - (separator used by W3C)
      var getTextFileValue = value.replace('-', '_');

      if (!dictionaries[value]) {
        try {
          dictionaries[value] = new _jed2.default(require('__locale_' + getTextFileValue));
        } catch (ex) {
          console.warn('Language with code ' + value + ' is not available, the following error has occurred: ' + ex);
        }
      }

      this._language = value;
    }
  }]);

  return _class;
}();

exports.default = _class;