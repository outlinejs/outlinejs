/**
 * Bootstrap utils module.
 * @module outlinejs/boot
 */
import {_init as contextInit} from '@outlinejs/contexts';
import {_init as confInit, settings} from '@outlinejs/conf';
import {runtime, RequestContext, ResponseContext} from '@outlinejs/contexts';
import crossroads from 'crossroads';
import {EventEmitter} from 'events';

/**
 * Class for bootstrapping an outlineJs project.
 */
export default class Boot {
  /**
   * Bootstrap the outlineJs isomorphic application.
   * @param {BaseSettings} settingsClass - The project settings class
   * @param {BaseRouter} routerClass - The main router class defined in main urls.js module
   * @param {string} containerNodeId - The node id where to render the view layer
   */
  static init(settingsClass, routerClass, containerNodeId) {
    contextInit(containerNodeId);
    confInit(settingsClass);
    Boot.start(routerClass);
  }

  static start(routerClass) {
    new routerClass(); //eslint-disable-line no-unused-vars, new-cap, no-new
    if (runtime.isClient) {
      Boot.bootClient();
    } else {
      Boot.bootServer();
    }
  }

  static bootServer() {
    let http = require('http');
    let urlModule = require('url');
    let proxyServer = '0.0.0.0';//process.env.server || '0.0.0.0';
    let proxyPort = 1337;//parseInt(process.env.port) || 1337;
    crossroads.ignoreState = true;
    crossroads.bypassed.add((req, res) => {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end('<html><body><h1>HTTP 404 - Page Not Found</h1><hr/><p>OutlineJS Server</p></body></html>');
    });
    http.createServer((req, res) => {
      let requestedUrl = urlModule.parse(req.url).pathname;
      Boot.processUrl(requestedUrl, req, res);
    }).listen(proxyPort, proxyServer);
  }

  static bootClient() {
    if (settings.ROUTING_USE_FRAGMENT) {
      let hasher = require('hasher');
      let parseHash = (fragment) => {
        Boot.processUrl(fragment);
      };
      hasher.prependHash = '';
      hasher.initialized.add(parseHash);
      hasher.changed.add(parseHash);
      hasher.init();
    } else {
      // create 'navigate' window event
      window.navigateEventEmitter = new EventEmitter();

      require('html5-history-api');
      let location = window.history.location || window.location;
      let eventDef = window.addEventListener ? ['addEventListener', ''] : ['attachEvent', 'on'];
      window[eventDef[0]](`${eventDef[1]}popstate`, () => {
        Boot.processUrl(location.pathname);
      }, false);
      window.navigateEventEmitter.on('navigate', () => {
        Boot.processUrl(location.pathname);
      });
      Boot.processUrl(location.pathname);
    }
  }

  static processUrl(path, req = {}, res = {}) {
    // add request context props to request
    let requestContext = new RequestContext(req);
    requestContext.decorate(req);

    let responseContext = new ResponseContext(res, req);
    responseContext.decorate(res);

    //run the middleware
    let middlewarePromises = [];

    for (let middleware of runtime.middleware) {
      //processRequest
      if (middleware.processRequest) {
        middlewarePromises.push(middleware.processRequest(req, res));
      }

      //processResponse
      if (middleware.processResponse) {
        middlewarePromises.push(middleware.processResponse(req, res));
      }
    }

    Promise.all(middlewarePromises).then(() => {
      //crossroad parse a string input and dispatch matched signal of the first route
      //that matches the request
      crossroads.parse(path, [req, res]);
    }, (error) => {
      res.error(error);
    });
  }
}
