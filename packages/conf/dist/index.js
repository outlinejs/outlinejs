'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports._init = _init;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var settings = exports.settings = null;

var BaseSettings = exports.BaseSettings = function () {
  function BaseSettings() {
    _classCallCheck(this, BaseSettings);
  }

  _createClass(BaseSettings, [{
    key: 'MIDDLEWARE',
    get: function get() {
      return [];
    }
  }, {
    key: 'LOGIN_STATE',
    get: function get() {
      return 'login';
    }
  }, {
    key: 'ROUTING_USE_FRAGMENT',
    get: function get() {
      return false;
    }
  }, {
    key: 'APPEND_SLASH',
    get: function get() {
      return true;
    }
  }, {
    key: 'SERVER_SIDE_LINK_ONLY',
    get: function get() {
      return false;
    }
  }, {
    key: 'DEFAULT_LANGUAGE',
    get: function get() {
      return 'en-US';
    }
  }, {
    key: 'LANGUAGES',
    get: function get() {
      //TODO: add missing languages
      return [this.DEFAULT_LANGUAGE, 'it-IT'];
    }
  }]);

  return BaseSettings;
}();

var _env = void 0;

try {
  _env = require('__outline_env');
} catch (ex) {
  _env = {};
}

if (!_env) {
  _env = {};
}

var Env = exports.Env = function () {
  function Env() {
    _classCallCheck(this, Env);
  }

  _createClass(Env, null, [{
    key: 'get',
    value: function get(value) {
      return _env[value];
    }
  }]);

  return Env;
}();

function _init(settingsClass) {
  exports.settings = settings = new settingsClass(); //eslint-disable-line new-cap
}