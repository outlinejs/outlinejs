'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RequestContext = exports.settings = exports.runtime = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports._initContexts = _initContexts;

var _translation = require('./utils/translation');

var _translation2 = _interopRequireDefault(_translation);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var runtime = exports.runtime = null;
var settings = exports.settings = null;

var RequestContext = exports.RequestContext = function () {
  function RequestContext(request) {
    _classCallCheck(this, RequestContext);

    this._user = null;
    this._state = null;
    this._language = null;
    this._i18n = new _translation2.default();
    this._request = request;
    this._query = null;
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
    key: 'isSecure',
    get: function get() {
      if (runtime.isClient) {
        require('html5-history-api');
        var location = window.history.location || window.location;
        return location.href.indexOf('https://') === 0;
      } else {
        if (this._request.connection.encrypted || this._request.headers['X-Forwarded-Proto'] === 'https') {
          return true;
        }
        return false;
      }
    }
  }, {
    key: 'absoluteUrl',
    get: function get() {
      if (runtime.isClient) {
        require('html5-history-api');
        var location = window.history.location || window.location;
        return location.href;
      } else {
        return (this.isSecure ? 'https' : 'http') + '://' + this._request.headers.host.replace(/:80$/, '') + this._request.url;
      }
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
      this._i18n.language = value;
      this._language = value;
    }
  }, {
    key: 'i18n',
    get: function get() {
      return this._i18n;
    }
  }, {
    key: 'query',
    get: function get() {
      if (!this._query) {
        this._query = _querystring2.default.decode(_url2.default.parse(this.absoluteUrl).query);
      }
      return this._query;
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

    if (this.isServer) {
      Error.prepareStackTrace = function (error, stack) {
        return stack;
      };
    }
  }

  _createClass(RuntimeContext, [{
    key: 'getTrace',
    value: function getTrace(e) {
      var trace = '';
      var spacer = '';
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = e.stack[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var frame = _step2.value;

          trace += '\n' + spacer + ' ' + frame.getTypeName() + '.' + frame.getFunctionName() + ' [line: ' + frame.getLineNumber() + ']';
          spacer += '--';
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return trace;
    }
  }, {
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