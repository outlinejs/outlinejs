import { RequestContext, runtime } from './contexts';
import crossroads from 'crossroads';
import React from 'react';
import { BaseComponent } from './components';

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
    if (runtime.isClient) {
      RouteUtils._listenClient();
    } else {
      RouteUtils._listenServer();
    }
  }

  static _listenServer() {
    var http = require('http');
    var urlModule = require('url');
    crossroads.ignoreState = true;
    crossroads.bypassed.add((req, res) => {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end('<html><body><h1>HTTP 404 - Page Not Found</h1><hr/><p>OutlineJS Server</p></body></html>');
    });
    http.createServer((req, res) => {
      var requestedUrl = urlModule.parse(req.url).pathname;
      RouteUtils.parseUrl(requestedUrl, req, res);
    }).listen(1337, '0.0.0.0');
  }

  static _listenClient() {
    require('html5-history-api');
    var location = window.history.location || window.location;
    var eventDef = window.addEventListener ? ['addEventListener', ''] : ['attachEvent', 'on'];
    window[eventDef[0]](`${eventDef[1]}popstate`, () => {
      RouteUtils.parseUrl(location.pathname);
    }, false);
    RouteUtils.parseUrl(location.pathname);
  }

  static parseUrl(path, req = {}, res = {}) {
    // add request context props to request
    var requestContext = new RequestContext();
    var requestContextProto = Reflect.getPrototypeOf(requestContext);
    for (let key of Reflect.ownKeys(requestContextProto)) {
      let descriptor = Reflect.getOwnPropertyDescriptor(requestContextProto, key);
      //props
      if (descriptor.get || descriptor.set) {
        Object.defineProperty(req, key, { get: () => { //eslint-disable-line no-loop-func
          return requestContext[key];
        }, set: (value) => { //eslint-disable-line no-loop-func
          requestContext[key] = value;
        }});
      }
      //methods
      if (descriptor.value) {
        req[key] = requestContext[key];
      }
    }
    //crossroad url parsing
    crossroads.parse(path, [req, res]);
  }

  static reverse(state, params = {}) {
    var url = _stateRouteMapping[state].interpolate(params); //eslint-disable-line no-shadow
    return `/${url}`;
  }

  static navigate(state, params = {}) {
    var url = RouteUtils.reverse(state, params); //eslint-disable-line no-shadow
    if (runtime.isClient) {
      var history = require('html5-history-api');
      history.pushState(null, null, url);
      RouteUtils.parseUrl(url);
    }
  }

  static query() {
    //TODO: server side
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

  static activeCssClass(request, state, cssClass = 'active') {
    if (request && request.isState(state)) {
      return cssClass;
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
          this.routeTo(rtObj, ...args);
        });
      }
    }
  }

  routeTo(urlDef, req, res, ...args) {
    var Controller = urlDef.controller;
    var midPromises = [];
    for (var mid of runtime.middleware) {
      if (mid.preControllerInit) {
        midPromises.push(mid.preControllerInit(req, res));
      }
    }
    Promise.all(midPromises).then(() => {
      req.state = urlDef.state;
      let controller = new Controller(req, res);
      if (runtime.isClient) {
        controller.reconcileWithServer();
      }
      controller.init(...args);
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

export class Link extends BaseComponent {
  static isLeftClickEvent(event) {
    return event.button === 0;
  }

  static isModifiedEvent(event) {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
  }

  handleClick(event) {
    let allowTransition = true;

    if (this.props.onClick) {
      this.props.onClick(event);
    }

    if (Link.isModifiedEvent(event) || !Link.isLeftClickEvent(event)) {
      return;
    }

    if (event.defaultPrevented === true) {
      allowTransition = false;
    }

    // If target prop is set (e.g. to "_blank") let browser handle link.
    if (this.props.target) {
      if (!allowTransition) {
        event.preventDefault();
      }
      return;
    }

    event.preventDefault();

    if (allowTransition) {
      const { state, params } = this.props;
      RouteUtils.navigate(state, params);
    }
  }

  render() {
    var props = {};
    props.href = RouteUtils.reverse(this.props.state, this.props.params);
    if (this.props.activeClassName) {
      if (this.request && this.request.isState(this.props.state)) {
        props.className = this.props.className === '' ? this.props.activeClassName : `${this.props.className} ${this.props.activeClassName}`;
      }
    }
    props.children = this.props.children;
    return <a {...props} onClick={this.handleClick.bind(this)} />;
  }
}
