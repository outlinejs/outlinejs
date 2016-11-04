'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseRouter = exports.RouteUtils = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.i18nUrl = i18nUrl;
exports.include = include;

var _crossroads = require('crossroads');

var _crossroads2 = _interopRequireDefault(_crossroads);

var _jed = require('jed');

var _contexts = require('./contexts');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _stateRouteMapping = {};

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

var IncludeDefinition = function () {
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
  var languages = _contexts.settings.LANGUAGES;
  var urlDefinition = [];

  languages.forEach(function (language) {
    urlDefinition.push(new UrlDefinition(language + ':' + state, controller, true));
  });

  return urlDefinition;
}

function include(router) {
  return new IncludeDefinition(router);
}

var RouteUtils = exports.RouteUtils = function () {
  function RouteUtils() {
    _classCallCheck(this, RouteUtils);
  }

  _createClass(RouteUtils, null, [{
    key: 'listen',
    value: function listen(routerClass) {
      new routerClass(); //eslint-disable-line no-unused-vars, new-cap, no-new
      if (_contexts.runtime.isClient) {
        RouteUtils._listenClient();
      } else {
        RouteUtils._listenServer();
      }
    }
  }, {
    key: '_listenServer',
    value: function _listenServer() {
      var http = require('http');
      var urlModule = require('url');
      var proxyServer = '0.0.0.0'; //process.env.server || '0.0.0.0';
      var proxyPort = 1337; //parseInt(process.env.port) || 1337;
      _crossroads2.default.ignoreState = true;
      _crossroads2.default.bypassed.add(function (req, res) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<html><body><h1>HTTP 404 - Page Not Found</h1><hr/><p>OutlineJS Server</p></body></html>');
      });
      http.createServer(function (req, res) {
        var requestedUrl = urlModule.parse(req.url).pathname;
        RouteUtils.parseUrl(requestedUrl, req, res);
      }).listen(proxyPort, proxyServer);
    }
  }, {
    key: '_listenClient',
    value: function _listenClient() {
      if (_contexts.settings.ROUTING_USE_FRAGMENT) {
        var hasher = require('hasher');
        var parseHash = function parseHash(fragment) {
          RouteUtils.parseUrl(fragment);
        };
        hasher.prependHash = '';
        hasher.initialized.add(parseHash);
        hasher.changed.add(parseHash);
        hasher.init();
      } else {
        require('html5-history-api');
        var location = window.history.location || window.location;
        var eventDef = window.addEventListener ? ['addEventListener', ''] : ['attachEvent', 'on'];
        window[eventDef[0]](eventDef[1] + 'popstate', function () {
          RouteUtils.parseUrl(location.pathname);
        }, false);
        RouteUtils.parseUrl(location.pathname);
      }
    }
  }, {
    key: 'parseUrl',
    value: function parseUrl(path) {
      var req = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var res = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      // add request context props to request
      var requestContext = new _contexts.RequestContext(req);
      requestContext.decorate(req);

      var responseContext = new _contexts.ResponseContext(res, req);
      responseContext.decorate(res);

      //crossroad url parsing
      _crossroads2.default.parse(path, [req, res]);
    }
  }, {
    key: 'reverse',
    value: function reverse(state) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var request = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var language = _contexts.settings.DEFAULT_LANGUAGE;

      // when a request is present set language
      // with the current request language
      if (request !== null) {
        language = request.i18n.language;
      }

      // update the state with the current language
      state = language + ':' + state;

      var url = _stateRouteMapping[state].interpolate(params); //eslint-disable-line no-shadow

      return '/' + url;
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

var BaseRouter = exports.BaseRouter = function () {
  function BaseRouter() {
    var _this = this;

    var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    _classCallCheck(this, BaseRouter);

    // init the routing mapping
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = Object.keys(this.urlPatterns)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;

        var urlPattern = this.urlPatterns[item];

        if (item !== '') {
          item = item + '/';
        }

        if (urlPattern instanceof IncludeDefinition) {
          // init a sub router modules
          new urlPattern.router('' + prefix + item); //eslint-disable-line new-cap, no-new
        } else {
          // urlPattern is an array of urlDefinition one
          // for each supported language
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            var _loop = function _loop() {
              var urlDefinition = _step2.value;

              //console.log('urlDefinition', urlDefinition);

              // language can be safety detect from first part
              // of state
              var language = urlDefinition.state.split(':')[0];
              var routeUrl = language + '/' + prefix + item;

              // check if the current url keyword has been translated,
              // if there is not a translation will be used the default routeUrl
              // value
              try {
                var getTextFileValue = language.replace('-', '_');
                var i18n = new _jed.Jed(require('__locale_' + getTextFileValue));
                var i18nUrlSegments = ('' + prefix + item).split('_i18n:');
                var tmpRouteUrl = '';

                //console.log('Split', i18nUrlSegments);

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                  for (var _iterator3 = i18nUrlSegments[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var i18nUrlSegment = _step3.value;

                    //console.log('i18nUrlSegment', i18nUrlSegment);

                    // skip the empty segment
                    if (i18nUrlSegment === '') {
                      continue;
                    }

                    var msgId = '_i18n:' + i18nUrlSegment.replace(/\/$/, '');

                    tmpRouteUrl = tmpRouteUrl + i18n.gettext(msgId) + '/';

                    //console.log('translate', `${msgId}`);
                    //console.log('tmpRouteUrl', `${tmpRouteUrl}`);
                  }

                  // add the current language
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

                routeUrl = language + '/' + tmpRouteUrl;

                // sanity check on /
                if (!routeUrl.endsWith('/')) {
                  routeUrl = routeUrl + '/';
                }

                //console.log('routeUrl', `${routeUrl}`);
              } catch (ex) {
                console.warn('The following error has occurred translating \'' + prefix + item + '\': ' + ex);
              }

              _stateRouteMapping[urlDefinition.state] = _crossroads2.default.addRoute(routeUrl, function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                //eslint-disable-line no-loop-func
                _this.routeTo.apply(_this, [urlDefinition].concat(args));
              });
            };

            for (var _iterator2 = urlPattern[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              _loop();
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
        }
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

  _createClass(BaseRouter, [{
    key: 'routeTo',
    value: function routeTo(urlDef, req, res) {
      for (var _len2 = arguments.length, args = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
        args[_key2 - 3] = arguments[_key2];
      }

      var Controller = urlDef.controller;
      var midPromises = [];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = _contexts.runtime.middleware[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var mid = _step4.value;

          if (mid.preControllerInit) {
            midPromises.push(mid.preControllerInit(req, res));
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

      if (_contexts.runtime.isClient) {
        // when client, set the current response object so we can control which controller can render the view
        _contexts.runtime.currentClientResponse = res;
      }
      Promise.all(midPromises).then(function () {
        if (Controller.loginRequired && !req.user) {
          try {
            var loginUrl = RouteUtils.reverse(_contexts.settings.LOGIN_STATE);
          } catch (ex) {
            res.error(new Error('State ' + _contexts.settings.LOGIN_STATE + ' is undefined'));
            return;
          }
          var nextUrl = encodeURIComponent(req.absoluteUrl);
          loginUrl = loginUrl + '?next-url=' + nextUrl;
          res.navigate(loginUrl);
          return;
        }

        req.state = urlDef.state;
        var controller = new Controller(req, res);
        if (_contexts.runtime.isClient) {
          controller.reconcileWithServer();
        }
        try {
          controller.init.apply(controller, args);
        } catch (ex) {
          res.error(ex);
        }
      }, function (error) {
        res.error(error);
      });
    }
  }, {
    key: 'urlPatterns',
    get: function get() {
      throw 'NotImplemented';
    }
  }]);

  return BaseRouter;
}();