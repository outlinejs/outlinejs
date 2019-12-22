"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._init = _init;
exports.BaseSettings = exports.settings = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var settings = new Proxy({}, {
  get: function get(target, name) {
    return global.__ojsSettings[name];
  }
});
exports.settings = settings;

var BaseSettings =
/*#__PURE__*/
function () {
  function BaseSettings() {
    _classCallCheck(this, BaseSettings);
  }

  _createClass(BaseSettings, [{
    key: "MIDDLEWARE",
    get: function get() {
      return [];
    }
  }, {
    key: "LOGIN_STATE",
    get: function get() {
      return 'login';
    }
  }, {
    key: "ROUTING_USE_FRAGMENT",
    get: function get() {
      return false;
    }
  }, {
    key: "APPEND_SLASH",
    get: function get() {
      return true;
    }
  }, {
    key: "SERVER_SIDE_LINK_ONLY",
    get: function get() {
      return false;
    }
  }, {
    key: "DEFAULT_LANGUAGE",
    get: function get() {
      return 'en-US';
    }
  }, {
    key: "LANGUAGES",
    get: function get() {
      //TODO: add missing languages
      return [this.DEFAULT_LANGUAGE, 'it-IT'];
    }
  }]);

  return BaseSettings;
}();

exports.BaseSettings = BaseSettings;

function _init(settingsClass) {
  global.__ojsSettings = new settingsClass(); //eslint-disable-line new-cap
}