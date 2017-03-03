'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Bootstrap utils module.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module outlinejs/boot
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _contexts = require('@outlinejs/contexts');

var _conf = require('@outlinejs/conf');

var _crossroads = require('crossroads');

var _crossroads2 = _interopRequireDefault(_crossroads);

var _events = require('events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Class for bootstrapping an outlineJs project.
 */
var Boot = function () {
  function Boot() {
    _classCallCheck(this, Boot);
  }

  _createClass(Boot, null, [{
    key: 'init',

    /**
     * Bootstrap the outlineJs isomorphic application.
     * @param {BaseSettings} settingsClass - The project settings class
     * @param {BaseRouter} routerClass - The main router class defined in main urls.js module
     * @param {string} containerNodeId - The node id where to render the view layer
     */
    value: function init(settingsClass, routerClass, containerNodeId) {
      (0, _conf._init)(settingsClass);
      (0, _contexts._init)(containerNodeId);
      Boot.start(routerClass);
    }
  }, {
    key: 'start',
    value: function start(routerClass) {
      new routerClass(); //eslint-disable-line no-unused-vars, new-cap, no-new
      if (_contexts.runtime.isClient) {
        Boot.bootClient();
      } else {
        Boot.bootServer();
      }
    }
  }, {
    key: 'bootServer',
    value: function bootServer() {
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
        Boot.processUrl(requestedUrl, req, res);
      }).listen(proxyPort, proxyServer);
    }
  }, {
    key: 'bootClient',
    value: function bootClient() {
      if (_conf.settings.ROUTING_USE_FRAGMENT) {
        var hasher = require('hasher');
        var parseHash = function parseHash(fragment) {
          Boot.processUrl(fragment);
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
          Boot.processUrl(location.pathname);
        }, false);
        window.navigateEventEmitter.on('navigate', function () {
          Boot.processUrl(location.pathname);
        });
        Boot.processUrl(location.pathname);
      }
    }
  }, {
    key: 'processUrl',
    value: function processUrl(path) {
      var req = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var res = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      // add request context props to request
      var requestContext = new _contexts.RequestContext(req);
      requestContext.decorate(req);

      var responseContext = new _contexts.ResponseContext(res, req);
      responseContext.decorate(res);

      //run the middleware
      var middlewarePromises = [];

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _contexts.runtime.middleware[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var middleware = _step.value;

          //processRequest
          if (middleware.processRequest) {
            middlewarePromises.push(middleware.processRequest(req, res));
          }

          //processResponse
          if (middleware.processResponse) {
            middlewarePromises.push(middleware.processResponse(req, res));
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

      Promise.all(middlewarePromises).then(function () {
        //crossroad parse a string input and dispatch matched signal of the first route
        //that matches the request
        _crossroads2.default.parse(path, [req, res]);
      }, function (error) {
        res.error(error);
      });
    }
  }]);

  return Boot;
}();

exports.default = Boot;