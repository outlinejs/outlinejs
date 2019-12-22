"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.url = url;
exports.include = include;
exports.IncludeDefinition = exports.Utils = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

global.__ojsStateRouteMapping = {};

var Utils =
/*#__PURE__*/
function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _createClass(Utils, null, [{
    key: "reverse",
    value: function reverse(state, request) {
      var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var callback = global.__ojsStateRouteMapping[state];

      if (!callback) {
        throw "State '".concat(state, "' is not registered.");
      }

      var reversedUrl = callback(params);

      if (reversedUrl === '/') {
        reversedUrl = '';
      }

      return "/".concat(reversedUrl);
    }
  }, {
    key: "mapRoute",
    value: function mapRoute(state, callback) {
      global.__ojsStateRouteMapping[state] = callback;
    }
  }, {
    key: "activeCssClass",
    value: function activeCssClass(state, request) {
      var cssClass = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'active';

      if (request && request.isState(state)) {
        return cssClass;
      }
    }
  }]);

  return Utils;
}();

exports.Utils = Utils;

var UrlDefinition =
/*#__PURE__*/
function () {
  function UrlDefinition(state, controller) {
    _classCallCheck(this, UrlDefinition);

    this._state = state;
    this._controller = controller;
  }

  _createClass(UrlDefinition, [{
    key: "state",
    get: function get() {
      return this._state;
    }
  }, {
    key: "controller",
    get: function get() {
      return this._controller;
    }
  }]);

  return UrlDefinition;
}();

var IncludeDefinition =
/*#__PURE__*/
function () {
  function IncludeDefinition(router) {
    _classCallCheck(this, IncludeDefinition);

    this._router = router;
  }

  _createClass(IncludeDefinition, [{
    key: "router",
    get: function get() {
      return this._router;
    }
  }]);

  return IncludeDefinition;
}();

exports.IncludeDefinition = IncludeDefinition;

function url(state, controller) {
  var urlDefinition = [];
  urlDefinition.push(new UrlDefinition(state, controller, true));
  return urlDefinition;
}

function include(router) {
  return new IncludeDefinition(router);
}