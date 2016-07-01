import {RequestContext, ResponseContext, runtime} from './contexts';
import crossroads from 'crossroads';
import React from 'react';
import {BaseComponent} from './components';
import {settings} from './contexts';

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
    var proxyServer = '0.0.0.0';//process.env.server || '0.0.0.0';
    var proxyPort = 1337;//parseInt(process.env.port) || 1337;
    crossroads.ignoreState = true;
    crossroads.bypassed.add((req, res) => {
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end('<html><body><h1>HTTP 404 - Page Not Found</h1><hr/><p>OutlineJS Server</p></body></html>');
    });
    http.createServer((req, res) => {
      var requestedUrl = urlModule.parse(req.url).pathname;
      RouteUtils.parseUrl(requestedUrl, req, res);
    }).listen(proxyPort, proxyServer);
  }

  static _listenClient() {
    if (settings.ROUTING_USE_FRAGMENT) {
      var hasher = require('hasher');
      var parseHash = (fragment) => {
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
      window[eventDef[0]](`${eventDef[1]}popstate`, () => {
        RouteUtils.parseUrl(location.pathname);
      }, false);
      RouteUtils.parseUrl(location.pathname);
    }
  }

  static parseUrl(path, req = {}, res = {}) {
    // add request context props to request
    var requestContext = new RequestContext(req);
    requestContext.decorate(req);

    var responseContext = new ResponseContext(res, this);
    responseContext.decorate(res);

    //crossroad url parsing
    crossroads.parse(path, [req, res]);
  }

  static reverse(state, params = {}) {
    var url = _stateRouteMapping[state].interpolate(params); //eslint-disable-line no-shadow
    return `/${url}`;
  }

  static activeCssClass(request, state, cssClass = 'active') {
    if (request && request.isState(state)) {
      return cssClass;
    }
  }
}

export class BaseRouter {
  constructor(prefix = '') {
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
    if (runtime.isClient) {
      //when client, set the current response object so we can control which controller can render the view
      runtime.currentClientResponse = res;
    }
    Promise.all(midPromises).then(() => {
      if (Controller.loginRequired && !req.user) {
        try {
          var loginUrl = RouteUtils.reverse(settings.LOGIN_STATE);
        } catch (ex) {
          res.error(new Error(`State ${settings.LOGIN_STATE} is undefined`));
          return;
        }
        var nextUrl = encodeURIComponent(req.absoluteUrl);
        loginUrl = `${loginUrl}?next-url=${nextUrl}`;
        res.navigate(loginUrl);
        return;
      }

      req.state = urlDef.state;
      let controller = new Controller(req, res);
      if (runtime.isClient) {
        controller.reconcileWithServer();
      }
      try {
        controller.init(...args);
      } catch (ex) {
        res.error(ex);
      }
    }, (error) => {
      res.error(error);
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
      const {state, params} = this.props;
      this.response.navigate(state, params);
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
    return <a {...props} onClick={this.handleClick.bind(this)}/>;
  }
}
