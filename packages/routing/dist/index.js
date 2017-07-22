'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.url = url;
exports.include = include;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _stateRouteMapping = {};

var Utils = exports.Utils = function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _createClass(Utils, null, [{
    key: 'reverse',
    value: function reverse(state, request) {
      var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var callback = _stateRouteMapping[state];
      if (!callback) {
        throw 'State \'' + state + '\' is not registered.';
      }
      var reversedUrl = callback(params);
      if (reversedUrl === '/') {
        reversedUrl = '';
      }
      return '/' + reversedUrl;
    }
  }, {
    key: 'mapRoute',
    value: function mapRoute(state, callback) {
      _stateRouteMapping[state] = callback;
    }
  }, {
    key: 'activeCssClass',
    value: function activeCssClass(state, request) {
      var cssClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'active';

      if (request && request.isState(state)) {
        return cssClass;
      }
    }
  }]);

  return Utils;
}();

var UrlDefinition = function () {
  function UrlDefinition(state, controller) {
    _classCallCheck(this, UrlDefinition);

    this._state = state;
    this._controller = controller;
  }

  _createClass(UrlDefinition, [{
    key: 'state',
    get: function get() {
      return this._state;
    }
  }, {
    key: 'controller',
    get: function get() {
      return this._controller;
    }
  }]);

  return UrlDefinition;
}();

var IncludeDefinition = exports.IncludeDefinition = function () {
  function IncludeDefinition(router) {
    _classCallCheck(this, IncludeDefinition);

    this._router = router;
  }

  _createClass(IncludeDefinition, [{
    key: 'router',
    get: function get() {
      return this._router;
    }
  }]);

  return IncludeDefinition;
}();

function url(state, controller) {
  var urlDefinition = [];
  urlDefinition.push(new UrlDefinition(state, controller, true));
  return urlDefinition;
}

function include(router) {
  return new IncludeDefinition(router);
}