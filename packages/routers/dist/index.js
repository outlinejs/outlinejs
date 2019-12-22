"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseRouter = void 0;

var _crossroads = _interopRequireDefault(require("crossroads"));

var _contexts = require("@outlinejs/contexts");

var _conf = require("@outlinejs/conf");

var _routing = require("@outlinejs/routing");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var BaseRouter =
/*#__PURE__*/
function () {
  function BaseRouter() {
    _classCallCheck(this, BaseRouter);
  }

  _createClass(BaseRouter, null, [{
    key: "init",
    value: function init() {
      if (_contexts.runtime.isServer) {
        _crossroads["default"].ignoreState = true; //TODO: bello!

        _crossroads["default"].bypassed.add(function (req, res) {
          res.writeHead(404, {
            'Content-Type': 'text/html'
          });
          res.end('<html><body><h1>HTTP 404 - Page Not Found</h1><hr/><p>OutlineJS Server</p></body></html>');
        });
      }

      this.loadRoutes();
    }
  }, {
    key: "dispatch",
    value: function dispatch(url, request, response) {
      _crossroads["default"].parse(url, [request, response]);
    }
  }, {
    key: "loadRoutes",
    value: function loadRoutes() {
      var _this = this;

      var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      // init the routing mapping
      for (var _i = 0, _Object$keys = Object.keys(this.urlPatterns); _i < _Object$keys.length; _i++) {
        var item = _Object$keys[_i];
        var urlPattern = this.urlPatterns[item];

        if (item !== '') {
          item = "".concat(item, "/");
        }

        if (urlPattern.router) {
          // init a sub router modules
          urlPattern.router.loadRoutes("".concat(prefix).concat(item));
        } else {
          // urlPattern is an array of urlDefinition
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            var _loop = function _loop() {
              var urlDefinition = _step.value;
              var routeUrl = "".concat(prefix).concat(item); // sanity check on /

              if (!routeUrl.endsWith('/')) {
                routeUrl = "".concat(routeUrl, "/");
              }

              var crossroadsRoute = _crossroads["default"].addRoute(routeUrl, function () {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                //eslint-disable-line no-loop-func
                _this.routeTo.apply(_this, [urlDefinition].concat(args));
              });

              _routing.Utils.mapRoute(urlDefinition.state, function (params) {
                return crossroadsRoute.interpolate(params);
              });
            };

            for (var _iterator = urlPattern[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              _loop();
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                _iterator["return"]();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      }
    }
  }, {
    key: "routeTo",
    value: function routeTo(urlDef, req, res) {
      var Controller = urlDef.controller;

      if (_contexts.runtime.isClient) {
        // when client, set the current response object so we can control which controller can render the view
        _contexts.runtime.currentClientResponse = res;
      }

      if (Controller.loginRequired && !req.user) {
        try {
          var loginUrl = _routing.Utils.reverse(_conf.settings.LOGIN_STATE, req, null);

          var nextUrl = encodeURIComponent(req.absoluteUrl);
          loginUrl = "".concat(loginUrl, "?next-url=").concat(nextUrl);
          res.navigate(loginUrl);
        } catch (ex) {
          res.error(new Error("State ".concat(_conf.settings.LOGIN_STATE, " is undefined")));
        }
      }

      req.state = urlDef.state;
      var controller = new Controller(req, res);

      if (_contexts.runtime.isClient) {
        controller.reconcileWithServer();
      }

      try {
        for (var _len2 = arguments.length, args = new Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
          args[_key2 - 3] = arguments[_key2];
        }

        controller.init.apply(controller, args);
      } catch (ex) {
        res.error(ex);
      }
    }
  }, {
    key: "urlPatterns",
    get: function get() {
      throw 'NotImplemented';
    }
  }]);

  return BaseRouter;
}();

exports.BaseRouter = BaseRouter;