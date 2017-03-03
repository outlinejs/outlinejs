'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IncludeDefinition = exports.RouteUtils = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.i18nUrl = i18nUrl;
exports.include = include;

var _conf = require('@outlinejs/conf');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _stateRouteMapping = {};

var RouteUtils = exports.RouteUtils = function () {
  function RouteUtils() {
    _classCallCheck(this, RouteUtils);
  }

  _createClass(RouteUtils, null, [{
    key: 'reverse',
    value: function reverse(state, request) {
      var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var language = request.i18n.language;
      // update the state with the current language
      state = language + ':' + state;

      var url = _stateRouteMapping[state](params); //eslint-disable-line no-shadow

      return '/' + url;
    }
  }, {
    key: 'mapRoute',
    value: function mapRoute(state, callback) {
      _stateRouteMapping[state] = callback;
    }
  }, {
    key: 'activeCssClass',
    value: function activeCssClass(request, state) {
      var cssClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'active';

      if (request && request.isState(state)) {
        return cssClass;
      }
    }
  }]);

  return RouteUtils;
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

function i18nUrl(state, controller) {
  var languages = _conf.settings.LANGUAGES;
  var urlDefinition = [];

  languages.forEach(function (language) {
    urlDefinition.push(new UrlDefinition(language + ':' + state, controller, true));
  });

  return urlDefinition;
}

function include(router) {
  return new IncludeDefinition(router);
}