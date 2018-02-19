'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RequestContext = exports.ResponseContext = exports.DecorableContext = exports.runtime = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports._init = _init;

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _translation = require('@outlinejs/translation');

var _translation2 = _interopRequireDefault(_translation);

var _conf = require('@outlinejs/conf');

var _routing = require('@outlinejs/routing');

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var runtime = exports.runtime = null;

var DecorableContext = exports.DecorableContext = function () {
  function DecorableContext() {
    _classCallCheck(this, DecorableContext);
  }

  _createClass(DecorableContext, [{
    key: 'decorate',
    value: function decorate(component) {
      var _this = this;

      var prototype = Reflect.getPrototypeOf(this);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var key = _step.value;

          var descriptor = Reflect.getOwnPropertyDescriptor(prototype, key);
          //props
          if (descriptor.get || descriptor.set) {
            Object.defineProperty(component, key, {
              get: function get() {
                //eslint-disable-line no-loop-func
                return _this[key];
              }, set: function set(value) {
                //eslint-disable-line no-loop-func
                _this[key] = value;
              }
            });
          }
          //methods
          if (descriptor.value) {
            component[key] = _this[key];
          }
        };

        for (var _iterator = Reflect.ownKeys(prototype)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
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
  }]);

  return DecorableContext;
}();

var ResponseContext = exports.ResponseContext = function (_DecorableContext) {
  _inherits(ResponseContext, _DecorableContext);

  function ResponseContext(response, request) {
    _classCallCheck(this, ResponseContext);

    var _this2 = _possibleConstructorReturn(this, (ResponseContext.__proto__ || Object.getPrototypeOf(ResponseContext)).call(this));

    _this2._response = response;
    _this2._request = request;
    return _this2;
  }

  _createClass(ResponseContext, [{
    key: 'navigate',
    value: function navigate(to) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var destinationUrl = void 0;
      try {
        destinationUrl = _routing.Utils.reverse(to, this.request, params);
      } catch (ex) {
        destinationUrl = to;

        if (runtime.isClient) {
          // check if it's an absolute url
          if (_url2.default.parse(destinationUrl).protocol) {
            window.location.href = destinationUrl;
            return;
          }
        }
      }

      if (runtime.isClient) {
        if (_conf.settings.ROUTING_USE_FRAGMENT) {
          var hasher = require('hasher');
          hasher.setHash(destinationUrl);
        } else {
          if (_conf.settings.SERVER_SIDE_LINK_ONLY) {
            window.location.href = destinationUrl;
          } else {
            var history = require('html5-history-api');
            history.pushState(null, null, destinationUrl);
            window.navigateEventEmitter.emit('navigate', destinationUrl);
          }
        }
      } else {
        this.response.writeHead(302, { Location: destinationUrl });
        this.response.end();
      }
    }
  }, {
    key: 'error',
    value: function error(ex) {
      if (runtime.isServer) {
        this.response.writeHead(500, { 'Content-Type': 'text/plain' });
        this.response.end(ex.toString() + '\n' + runtime.getTrace(ex));
      } else {
        console.error(ex);
      }
    }
  }, {
    key: 'response',
    get: function get() {
      return this._response;
    }
  }, {
    key: 'request',
    get: function get() {
      return this._request;
    }
  }]);

  return ResponseContext;
}(DecorableContext);

var RequestContext = exports.RequestContext = function (_DecorableContext2) {
  _inherits(RequestContext, _DecorableContext2);

  function RequestContext(request) {
    _classCallCheck(this, RequestContext);

    var _this3 = _possibleConstructorReturn(this, (RequestContext.__proto__ || Object.getPrototypeOf(RequestContext)).call(this));

    _this3._user = null;
    _this3._state = null;
    _this3._language = _conf.settings.DEFAULT_LANGUAGE;
    _this3._i18n = new _translation2.default();
    _this3._request = request;
    _this3._query = null;
    return _this3;
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
}(DecorableContext);

var RuntimeContext = function () {
  function RuntimeContext(containerNodeId) {
    _classCallCheck(this, RuntimeContext);

    this._routerClass = null;
    this._containerNodeId = containerNodeId;
    this._serverRenderContainerPattern = new RegExp('(id="' + containerNodeId + '"[^>]*>?)(.*?)(</)');
    this._middleware = [];
    if (this.isClient) {
      this._renderContainerObject = document.getElementById(this.containerNodeId);
      if (!this._renderContainerObject) {
        var mainDiv = document.createElement('div');
        mainDiv.id = 'main';
        this._renderContainerObject = mainDiv;
        document.getElementsByTagName('body')[0].appendChild(mainDiv);
      }
    } else {
      var html = require('__main_html');
      html = html.replace(/"((?:[^"]*?)\.(?:js|css))"/g, '"/$1"');
      this._renderContainerObject = html;
    }
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = _conf.settings.MIDDLEWARE[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var mid = _step2.value;

        this._middleware.push(new mid()); //eslint-disable-line new-cap
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
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = e.stack[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var frame = _step3.value;

          trace += '\n' + spacer + ' ' + frame.getTypeName() + '.' + frame.getFunctionName() + ' [line: ' + frame.getLineNumber() + ']';
          spacer += '--';
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return trace;
    }
  }, {
    key: 'runServer',
    value: function runServer() {
      var _this4 = this;

      var http = require('http');
      var urlModule = require('url');
      var proxyServer = '0.0.0.0'; //process.env.server || '0.0.0.0';
      var proxyPort = 1337; //parseInt(process.env.port) || 1337;
      http.createServer(function (req, res) {
        var requestedUrl = urlModule.parse(req.url).pathname;
        _this4.processUrl(requestedUrl, req, res);
      }).listen(proxyPort, proxyServer);
    }
  }, {
    key: 'runClient',
    value: function runClient() {
      var _this5 = this;

      if (_conf.settings.ROUTING_USE_FRAGMENT) {
        var hasher = require('hasher');
        var parseHash = function parseHash(fragment) {
          var location = _url2.default.parse(fragment);
          _this5.processUrl(location.pathname);
        };
        hasher.prependHash = '';
        hasher.initialized.add(parseHash);
        hasher.changed.add(parseHash);
        hasher.init();
      } else {
        // create 'navigate' window event
        window.navigateEventEmitter = new _events.EventEmitter();

        require('html5-history-api');
        var location = window.history.location || window.location;
        var eventDef = window.addEventListener ? ['addEventListener', ''] : ['attachEvent', 'on'];
        window[eventDef[0]](eventDef[1] + 'popstate', function () {
          _this5.processUrl(location.pathname);
        }, false);
        window.navigateEventEmitter.on('navigate', function () {
          _this5.processUrl(location.pathname);
        });
        this.processUrl(location.pathname);
      }
    }
  }, {
    key: 'processUrl',
    value: function processUrl(path) {
      var _this6 = this;

      var req = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var res = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      // add request context props to request
      var requestContext = new RequestContext(req);
      requestContext.decorate(req);

      var responseContext = new ResponseContext(res, req);
      responseContext.decorate(res);

      //run the middleware
      var middlewarePromises = [];

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = runtime.middleware[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var middleware = _step4.value;

          //processRequest
          if (middleware.processRequest) {
            middlewarePromises.push(middleware.processRequest(req, res));
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      middlewarePromises.reduce(function (promiseChain, current) {
        return promiseChain.then(function (chainResults) {
          return current.then(function (currentResult) {
            return [].concat(_toConsumableArray(chainResults), [currentResult]);
          });
        });
      }, Promise.resolve([])).then(function () {
        _this6.routerClass.dispatch(path, req, res);
      }, function (error) {
        res.error(error);
      });
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
  }, {
    key: 'currentClientResponse',
    get: function get() {
      return this._currentClientResponse;
    },
    set: function set(value) {
      this._currentClientResponse = value;
    }
  }, {
    key: 'routerClass',
    get: function get() {
      return this._routerClass;
    },
    set: function set(value) {
      this._routerClass = value;
    }
  }]);

  return RuntimeContext;
}();

function _init(containerNodeId, routerClass) {
  exports.runtime = runtime = new RuntimeContext(containerNodeId);
  routerClass.init();
  runtime.routerClass = routerClass;
  if (runtime.isClient) {
    runtime.runClient();
  } else {
    runtime.runServer();
  }
}