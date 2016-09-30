'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BaseSettings = exports.BaseSettings = function () {
  function BaseSettings() {
    _classCallCheck(this, BaseSettings);
  }

  _createClass(BaseSettings, [{
    key: 'MIDDLEWARE',
    get: function get() {
      return [require('./middleware/locale')];
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
      return [this.DEFAULT_LANGUAGE, 'it-IT'];
    }
  }]);

  return BaseSettings;
}();