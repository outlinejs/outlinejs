/**
 * Bootstrap utils module.
 * @module outlinejs/boot
 */
import {_initContexts} from '@outlinejs/contexts';
import {RouteUtils} from '@outlinejs/routers';
import {runtime, settings} from '@outlinejs/contexts';
import crossroads from 'crossroads';

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
    _initContexts(settingsClass, containerNodeId);
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
      RouteUtils.parseUrl(requestedUrl, req, res);
    }).listen(proxyPort, proxyServer);
  }

  static bootClient() {
    if (settings.ROUTING_USE_FRAGMENT) {
      let hasher = require('hasher');
      let parseHash = (fragment) => {
        RouteUtils.parseUrl(fragment);
      };
      hasher.prependHash = '';
      hasher.initialized.add(parseHash);
      hasher.changed.add(parseHash);
      hasher.init();
    } else {
      require('html5-history-api');
      let location = window.history.location || window.location;
      let eventDef = window.addEventListener ? ['addEventListener', ''] : ['attachEvent', 'on'];
      window[eventDef[0]](`${eventDef[1]}popstate`, () => {
        RouteUtils.parseUrl(location.pathname);
      }, false);
      RouteUtils.parseUrl(location.pathname);
    }
  }
}
