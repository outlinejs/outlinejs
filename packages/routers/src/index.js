import crossroads from 'crossroads';
import {Jed} from 'jed';
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
