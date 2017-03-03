'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseRouter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crossroads = require('crossroads');

var _crossroads2 = _interopRequireDefault(_crossroads);

var _jed = require('jed');

var _contexts = require('@outlinejs/contexts');

var _conf = require('@outlinejs/conf');

var _routeUtils = require('@outlinejs/route-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

        if (urlPattern instanceof _routeUtils.IncludeDefinition) {
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

              var crossroadsRoute = _crossroads2.default.addRoute(routeUrl, function () {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                //eslint-disable-line no-loop-func
                _this.routeTo.apply(_this, [urlDefinition].concat(args));
              });

              _routeUtils.RouteUtils.mapRoute(urlDefinition.state, function (params) {
                crossroadsRoute.interpolate(params);
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
      var Controller = urlDef.controller;

      if (_contexts.runtime.isClient) {
        // when client, set the current response object so we can control which controller can render the view
        _contexts.runtime.currentClientResponse = res;
      }

      if (Controller.loginRequired && !req.user) {
        try {
          var loginUrl = _routeUtils.RouteUtils.reverse(_conf.settings.LOGIN_STATE, req, null);
          var nextUrl = encodeURIComponent(req.absoluteUrl);
          loginUrl = loginUrl + '?next-url=' + nextUrl;
          res.navigate(loginUrl);
        } catch (ex) {
          res.error(new Error('State ' + _conf.settings.LOGIN_STATE + ' is undefined'));
        }
      }

      req.state = urlDef.state;

      var controller = new Controller(req, res);

      if (_contexts.runtime.isClient) {
        controller.reconcileWithServer();
      }

      try {
        for (var _len2 = arguments.length, args = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
          args[_key2 - 3] = arguments[_key2];
        }

        controller.init.apply(controller, args);
      } catch (ex) {
        res.error(ex);
      }
    }
  }, {
    key: 'urlPatterns',
    get: function get() {
      throw 'NotImplemented';
    }
  }]);

  return BaseRouter;
}();