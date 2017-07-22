import crossroads from 'crossroads';
import {runtime} from '@outlinejs/contexts';
import {settings} from '@outlinejs/conf';
import {IncludeDefinition, Utils as RouteUtils} from '@outlinejs/routing';

export class BaseRouter {
  static init() {
    if (runtime.isServer) {
      crossroads.ignoreState = true;
      crossroads.bypassed.add((req, res) => {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('<html><body><h1>HTTP 404 - Page Not Found</h1><hr/><p>OutlineJS Server</p></body></html>');
      });
    }
    this.loadRoutes();
  }

  static dispatch(url, request, response) {
    crossroads.parse(url, [request, response]);
  }

  static loadRoutes(prefix = '') {
    // init the routing mapping
    for (let item of Object.keys(this.urlPatterns)) {
      let urlPattern = this.urlPatterns[item];

      if (item !== '') {
        item = `${item}/`;
      }

      if (urlPattern instanceof IncludeDefinition) {
        // init a sub router modules
        urlPattern.router.loadRoutes(`${prefix}${item}`);
      } else {
        // urlPattern is an array of urlDefinition
        for (let urlDefinition of urlPattern) {

          let routeUrl = `${prefix}${item}`;
          // sanity check on /
          if (!routeUrl.endsWith('/')) {
            routeUrl = `${routeUrl}/`;
          }

          let crossroadsRoute = crossroads.addRoute(routeUrl, (...args) => { //eslint-disable-line no-loop-func
            this.routeTo(urlDefinition, ...args);
          });

          RouteUtils.mapRoute(urlDefinition.state, (params) => {
            return crossroadsRoute.interpolate(params);
          });
        }
      }
    }
  }

  static routeTo(urlDef, req, res, ...args) {
    let Controller = urlDef.controller;

    if (runtime.isClient) {
      // when client, set the current response object so we can control which controller can render the view
      runtime.currentClientResponse = res;
    }

    if (Controller.loginRequired && !req.user) {
      try {
        let loginUrl = RouteUtils.reverse(settings.LOGIN_STATE, req, null);
        let nextUrl = encodeURIComponent(req.absoluteUrl);
        loginUrl = `${loginUrl}?next-url=${nextUrl}`;
        res.navigate(loginUrl);
      } catch (ex) {
        res.error(new Error(`State ${settings.LOGIN_STATE} is undefined`));
      }
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
  }

  static get urlPatterns() {
    throw 'NotImplemented';
  }
}
