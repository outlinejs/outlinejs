import crossroads from 'crossroads';

import { Jed } from 'jed';
import { RequestContext, ResponseContext, runtime } from '@outlinejs/contexts';
import { settings } from '@outlinejs/contexts';

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

export function i18nUrl(state, controller) {
  let languages = settings.LANGUAGES;
  let urlDefinition = [];

  languages.forEach(function (language) {
    urlDefinition.push(new UrlDefinition(language + ':' + state, controller, true));
  });

  return urlDefinition;
}

export function include(router) {
  return new IncludeDefinition(router);
}

export class RouteUtils {
  static parseUrl(path, req = {}, res = {}) {
    // add request context props to request
    var requestContext = new RequestContext(req);
    requestContext.decorate(req);

    var responseContext = new ResponseContext(res, req);
    responseContext.decorate(res);

    //run the middleware
    var middlewarePromises = [];

    for (var middleware of runtime.middleware) {
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

  static reverse(state, params = {}, request = null) {
    let language = settings.DEFAULT_LANGUAGE;

    // when a request is present set language
    // with the current request language
    if (request !== null) {
      language = request.i18n.language;
    }

    // update the state with the current language
    state = language + ':' + state;

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
    // init the routing mapping
    for (let item of Object.keys(this.urlPatterns)) {
      let urlPattern = this.urlPatterns[item];

      if (item !== '') {
        item = `${item}/`;
      }

      if (urlPattern instanceof IncludeDefinition) {
        // init a sub router modules
        new urlPattern.router(`${prefix}${item}`); //eslint-disable-line new-cap, no-new
      } else {
        // urlPattern is an array of urlDefinition one
        // for each supported language
        for (let urlDefinition of urlPattern) {
          //console.log('urlDefinition', urlDefinition);

          // language can be safety detect from first part
          // of state
          let language = urlDefinition.state.split(':')[0];
          let routeUrl = `${language}/${prefix}${item}`;

          // check if the current url keyword has been translated,
          // if there is not a translation will be used the default routeUrl
          // value
          try {
            let getTextFileValue = language.replace('-', '_');
            let i18n = new Jed(require(`__locale_${getTextFileValue}`));
            let i18nUrlSegments = `${prefix}${item}`.split('_i18n:');
            let tmpRouteUrl = '';

            //console.log('Split', i18nUrlSegments);

            for (let i18nUrlSegment of i18nUrlSegments) {
              //console.log('i18nUrlSegment', i18nUrlSegment);

              // skip the empty segment
              if (i18nUrlSegment === '') {
                continue;
              }

              let msgId = '_i18n:' + i18nUrlSegment.replace(/\/$/, '');

              tmpRouteUrl = tmpRouteUrl + i18n.gettext(msgId) + '/';

              //console.log('translate', `${msgId}`);
              //console.log('tmpRouteUrl', `${tmpRouteUrl}`);
            }

            // add the current language
            routeUrl = `${language}/${tmpRouteUrl}`;

            // sanity check on /
            if (!routeUrl.endsWith('/')) {
              routeUrl = `${routeUrl}/`;
            }

            //console.log('routeUrl', `${routeUrl}`);
          } catch (ex) {
            console.warn(`The following error has occurred translating '${prefix}${item}': ${ex}`);
          }

          _stateRouteMapping[urlDefinition.state] = crossroads.addRoute(routeUrl, (...args) => { //eslint-disable-line no-loop-func
            this.routeTo(urlDefinition, ...args);
          });
        }
      }
    }
  }

  routeTo(urlDef, req, res, ...args) {
    var Controller = urlDef.controller;

    if (runtime.isClient) {
      // when client, set the current response object so we can control which controller can render the view
      runtime.currentClientResponse = res;
    }

    if (Controller.loginRequired && !req.user) {
      try {
        var loginUrl = RouteUtils.reverse(settings.LOGIN_STATE, null, req);
      } catch (ex) {
        res.error(new Error(`State ${settings.LOGIN_STATE} is undefined`));
        return;
      }
      var nextUrl = encodeURIComponent(req.url.href);
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
  }

  get urlPatterns() {
    throw 'NotImplemented';
  }
}
