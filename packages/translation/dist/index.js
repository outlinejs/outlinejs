"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _jed = _interopRequireDefault(require("jed"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

global.__ojsTranslationDictionaries = {};

var _default =
/*#__PURE__*/
function () {
  function _default() {
    _classCallCheck(this, _default);

    this._language = null;
  }

  _createClass(_default, [{
    key: "gettext",
    value: function gettext(msgid) {
      var currentDictionary = global.__ojsTranslationDictionaries[this._language];

      if (currentDictionary) {
        return currentDictionary.gettext(msgid);
      }

      return msgid;
    }
  }, {
    key: "ngettext",
    value: function ngettext(singular, plural, count) {
      var currentDictionary = global.__ojsTranslationDictionaries[this._language];

      if (currentDictionary) {
        return currentDictionary.ngettext(singular, plural, count);
      }

      return count === 1 ? singular : plural;
    }
  }, {
    key: "gettext_noop",
    value: function gettext_noop(msgid) {
      //eslint-disable-line camelcase
      return msgid;
    }
  }, {
    key: "pgettext",
    value: function pgettext(context, msgid) {
      var currentDictionary = global.__ojsTranslationDictionaries[this._language];

      if (currentDictionary) {
        return currentDictionary.pgettext(context, msgid);
      }

      return msgid;
    }
  }, {
    key: "npgettext",
    value: function npgettext(context, singular, plural, count) {
      var currentDictionary = global.__ojsTranslationDictionaries[this._language];

      if (currentDictionary) {
        return currentDictionary.npgettext(context, singular, plural, count);
      }

      return count === 1 ? singular : plural;
    }
  }, {
    key: "language",
    get: function get() {
      return this._language;
    },
    set: function set(value) {
      if (!global.__ojsTranslationDictionaries[value]) {
        console.warn("Language with code ".concat(value, " is not available."));
      }

      this._language = value;
    }
  }], [{
    key: "addTranslation",
    value: function addTranslation(translation) {
      var trans = new _jed["default"](translation); // patch language value with _ (separator used by gettext)
      // instead of - (separator used by W3C)

      var lang = trans.options.locale_data.messages[''].lang.replace('_', '-');
      global.__ojsTranslationDictionaries[lang] = trans;
    }
  }]);

  return _default;
}();

exports["default"] = _default;