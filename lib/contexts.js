'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports._initContexts = _initContexts;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var runtime = exports.runtime = null;
var settings = exports.settings = null;

var RequestContext = exports.RequestContext = function () {
  function RequestContext() {
    _classCallCheck(this, RequestContext);

    this._user = null;
    this._state = null;
    this._language = null;
  }

  _createClass(RequestContext, [{
    key: 'isState',
    value: function isState(state) {
      return this.state.indexOf(state) === 0;
    }
  }, {
    key: 'user',
    get: function get() {
      return this._user;
    },
    set: function set(value) {
      this._user = value;
    }
  }, {
    key: 'state',
    get: function get() {
      return this._state;
    },
    set: function set(value) {
      this._state = value;
    }
  }, {
    key: 'language',
    get: function get() {
      return this._language;
    },
    set: function set(value) {
      this._language = value;
    }
  }]);

  return RequestContext;
}();

var RuntimeContext = function () {
  function RuntimeContext(containerNodeId) {
    _classCallCheck(this, RuntimeContext);

    this._containerNodeId = containerNodeId;
    this._serverRenderContainerPattern = new RegExp('(id="' + containerNodeId + '"[^>]*>?)(.*?)(</)');
    this._middleware = [];
    if (this.isClient) {
      this._renderContainerObject = document.getElementById(this.containerNodeId);
    } else {
      var html = require('__main_html');
      html = html.replace(/"((?:[^"]*?)\.(?:js|css))"/g, '"/$1"');
      this._renderContainerObject = html;
    }
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = settings.MIDDLEWARE[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var mid = _step.value;

        this._middleware.push(new mid.default()); //eslint-disable-line new-cap
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  _createClass(RuntimeContext, [{
    key: 'middleware',
    get: function get() {
      return this._middleware;
    }
  }, {
    key: 'containerNodeId',
    get: function get() {
      return this._containerNodeId;
    }
  }, {
    key: 'serverRenderContainerPattern',
    get: function get() {
      return this._serverRenderContainerPattern;
    }
  }, {
    key: 'renderContainerObject',
    get: function get() {
      return this._renderContainerObject;
    }
  }, {
    key: 'isClient',
    get: function get() {
      return typeof window !== 'undefined';
    }
  }, {
    key: 'isServer',
    get: function get() {
      return !this.isClient;
    }
  }]);

  return RuntimeContext;
}();

function _initContexts(settingsClass, containerNodeId) {
  exports.settings = settings = new settingsClass(); //eslint-disable-line new-cap
  exports.runtime = runtime = new RuntimeContext(containerNodeId);
}