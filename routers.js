import { global, runtime } from './contexts';
import crossroads from 'crossroads';

let _stateRouteMapping = {};

class UrlDefinition {
  constructor(state, controller) {
    this._state = state;
    this._controller = controller;
  }

  get state() {
    return this._state;
  }

  get controller() {
    return this._controller;
  }
}

class IncludeDefinition {
  constructor(router) {
    this._router = router;
  }

  get router() {
    return this._router;
  }
}

export function url(state, controller) {
  return new UrlDefinition(state, controller);
}

export function include(router) {
  return new IncludeDefinition(router);
}

export class RouteUtils {
  static listen(routerClass) {
    new routerClass(); //eslint-disable-line no-unused-vars, new-cap, no-new

    function parseUrl(newHash) {
      crossroads.parse(newHash);
    }

    if (runtime.isClient) {
      var hasher = require('hasher');
      hasher.initialized.add(parseUrl);
      hasher.changed.add(parseUrl);
      hasher.prependHash = '';
      hasher.init();
    } else {
      var http = require('http');
      var urlModule = require('url');
      http.createServer((req, res) => {
        parseUrl(urlModule.parse(req.url).pathname);
      }).listen(1337, '0.0.0.0');
    }
  }

  static reverse(state, params = {}, prependHash = true) {
    var url = _stateRouteMapping[state].interpolate(params); //eslint-disable-line no-shadow
    if (prependHash) {
      return `#${url}`;
    }
    return url;
  }

  static navigate(state, params = {}) {
    var url = RouteUtils.reverse(state, params, false); //eslint-disable-line no-shadow
    if (runtime.isClient) {
      var hasher = require('hasher');
      hasher.setHash(url);
    }
  }

  static query() {
    var href = window.location.href;
    var result = {};
    if (href.includes('#')) {
      href = href.split('#')[1];
    }
    href = href.split('?')[1];
    if (href) {
      for (let param of href.split('&')) {
        let [k, v] = param.split('=');
        result[decodeURIComponent(k)] = decodeURIComponent(v);
      }
    }
    return result;
  }

  static isState(state, className = 'active') {
    if (global.state.indexOf(state) === 0) {
      return className;
    }
  }
}

export class BaseRouter {
  constructor(prefix = '') {
    if (prefix !== '') {
      prefix = `${prefix}/`;
    }
    //find subRoutes
    for (let rt of Object.keys(this.urlPatterns)) {
      let rtObj = this.urlPatterns[rt];
      if (rt !== '') {
        rt = `${rt}/`;
      }
      if (rtObj instanceof IncludeDefinition) {
        //instantiate sub router
        new rtObj.router(`${prefix}${rt}`); //eslint-disable-line new-cap, no-new
      } else {
        var rUrl = `${prefix}${rt}`;
        _stateRouteMapping[rtObj.state] = crossroads.addRoute(rUrl, (...args) => { //eslint-disable-line no-loop-func
          this.routeTo(rtObj, args);
        });
      }
    }
  }

  routeTo(urlDef, args) {
    var Controller = urlDef.controller;
    var midPromises = [];
    for (var mid of runtime.middleware) {
      if (mid.preControllerInit) {
        midPromises.push(mid.preControllerInit());
      }
    }
    Promise.all(midPromises).then(() => {
      global.state = urlDef.state;
      new Controller().init(...args);
    }, (error) => {
      if (error) {
        console.log(error);
      }
    });
  }

  get urlPatterns() {
    throw 'NotImplemented';
  }
}
