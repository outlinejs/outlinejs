import BackboneSubRoute from 'backbone.subroute';
import { settings } from './contexts';
import { global, runtime } from './contexts';

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
  static _urlParamsReplace(url, params) { //eslint-disable-line no-shadow
    for (let pkey of Object.keys(params)) {
      let beforeReplace = url;
      url = url.replace(`:${pkey}`, params[pkey]);
      if (beforeReplace === url) {
        throw `Unable to find reverse url for "${beforeReplace}" with params ${JSON.stringify(params)}.`;
      }
    }
    return url;
  }

  static reverse(state, params = {}, prependHash = true) {
    var url = _stateRouteMapping[state].route; //eslint-disable-line no-shadow
    url = RouteUtils._urlParamsReplace(url, params);
    if (prependHash) {
      return `#${url}`;
    }
    return url;
  }

  static navigate(state, params = {}) {
    var routeMapping = _stateRouteMapping[state];
    var url = _stateRouteMapping[state].route; //eslint-disable-line no-shadow
    url = RouteUtils._urlParamsReplace(url, params);
    routeMapping.router.navigate(url, {trigger: true});
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

export class BaseRouter extends BackboneSubRoute {
  constructor(prefix, options, mainElement) {
    super(prefix, options);

    //find subRoutes
    for (let rt of Object.keys(this.routes)) {
      let rtObj = this.routes[rt];
      if (rtObj instanceof IncludeDefinition) {
        //instantiate sub router
        new rtObj.router(rt, options, mainElement); //eslint-disable-line new-cap, no-new
        delete this.routes[rt];
      } else {
        _stateRouteMapping[rtObj.state] = {route: rt, router: this};
      }
    }

    this.on('route', function (urlDef, args) {
      var Controller = urlDef.controller;
      var routeContext = {
        currentState: urlDef.state,
        element: mainElement
      };
      var midPromises = [];
      for (var mid of runtime.middleware) {
        if (mid.preControllerInit) {
          midPromises.push(mid.preControllerInit());
        }
      }
      Promise.all(midPromises).then(() => {
        global.state = urlDef.state;
        new Controller(routeContext).init(...args);
      }, (error) => {
        if (error) {
          console.log(error);
        }
      });
    });
  }

  get routes() {
    if (!this._routes) {
      this._routes = this.urlPatterns;
    }
    return this._routes;
  }
}
