import querystring from 'querystring';
import url from 'url';
import Translation from '@outlinejs/translation';

export let runtime = null;
export let settings = null;

export class DecorableContext {
  decorate(component) {
    let prototype = Reflect.getPrototypeOf(this);

    for (let key of Reflect.ownKeys(prototype)) {
      let descriptor = Reflect.getOwnPropertyDescriptor(prototype, key);
      //props
      if (descriptor.get || descriptor.set) {
        Object.defineProperty(component, key, {
          get: () => { //eslint-disable-line no-loop-func
            return this[key];
          }, set: (value) => { //eslint-disable-line no-loop-func
            this[key] = value;
          }
        });
      }
      //methods
      if (descriptor.value) {
        component[key] = this[key];
      }
    }
  }
}

export class ResponseContext extends DecorableContext {
  constructor(response, request) {
    super();

    this._response = response;
    this._request = request;
    this._router = require('@outlinejs/routers');
  }

  get response() {
    return this._response;
  }

  get request() {
    return this._request;
  }

  get routeUtils() {
    return this._router.RouteUtils;
  }

  navigate(to, params = {}) {
    let url; //eslint-disable-line no-shadow

    try {
      url = this.routeUtils.reverse(to, params, this.request);
    } catch (ex) {
      console.error(ex);

      url = to;

      if (runtime.isClient) {
        window.location.href = url;

        return;
      }
    }

    if (runtime.isClient) {
      if (settings.ROUTING_USE_FRAGMENT) {
        let hasher = require('hasher');
        hasher.setHash(url);
      } else {
        if (settings.SERVER_SIDE_LINK_ONLY) {
          window.location.href = url;
        } else {
          let history = require('html5-history-api');
          history.pushState(null, null, url);
          this.routeUtils.parseUrl(url);
        }
      }
    } else {
      this.response.writeHead(302, {Location: url});
      this.response.end();
    }
  }

  error(ex) {
    if (runtime.isServer) {
      this.response.writeHead(500, {'Content-Type': 'text/plain'});
      this.response.end(`${ex.toString()}\n${runtime.getTrace(ex)}`);
    } else {
      console.error(ex);
    }
  }

}

class Url {
  constructor(request) {
    this._request = request;
    this._clientUrl = null;
    this._serverUrl = null;

    if (runtime.isClient) {
      // class URL is not supported on IE / EDGE ...
      // so use old location
      require('html5-history-api');

      this._clientUrl = window.history.location || window.location;
    } else {
      let protocol = this._request.connection.encrypted || this._request.headers['X-Forwarded-Proto'] === 'https' ?
        'https:' : 'http:';

      this._serverUrl = new URL(`${protocol}//${this._request.headers.host.replace(/:80$/, '')}${this._request.url}`);
    }
  }

  get href() {
    if (runtime.isClient) {
      return this._clientUrl.href;
    } else {
      return this._serverUrl.href;
    }
  }

  get protocol() {
    if (runtime.isClient) {
      return this._clientUrl.protocol;
    } else {
      return this._serverUrl.protocol;
    }
  }

  get username() {
    if (runtime.isClient) {
      return this._clientUrl.username;
    } else {
      return this._serverUrl.username;
    }
  }

  get password() {
    if (runtime.isClient) {
      return this._clientUrl.password;
    } else {
      return this._serverUrl.password;
    }
  }

  get hostname() {
    if (runtime.isClient) {
      return this._clientUrl.hostname;
    } else {
      return this._serverUrl.hostname;
    }
  }

  get port() {
    if (runtime.isClient) {
      return this._clientUrl.port;
    } else {
      return this._serverUrl.port;
    }
  }

  get origin() {
    if (runtime.isClient) {
      return this._clientUrl.origin;
    } else {
      return this._serverUrl.origin;
    }
  }

  get pathname() {
    if (runtime.isClient) {
      return this._clientUrl.pathname;
    } else {
      return this._serverUrl.pathname;
    }
  }

  get search() {
    if (runtime.isClient) {
      return this._clientUrl.search;
    } else {
      return this._serverUrl.search;
    }
  }

  get query() {
    if (runtime.isClient) {
      let qs = require('qs');

      return qs.parse(this._clientUrl.query);
    } else {
      return this._serverUrl.query;
    }
  }

  get path() {
    if (runtime.isClient) {
      return this._clientUrl.pathname + this._clientUrl.search;
    } else {
      return this._serverUrl.path;
    }
  }

  get hash() {
    if (runtime.isClient) {
      return this._clientUrl.hash;
    } else {
      return this._serverUrl.hash;
    }
  }
}

export class RequestContext extends DecorableContext {
  constructor(request) {
    super();

    this._user = null;
    this._state = null;
    this._language = null;
    this._i18n = new Translation();
    this._request = request;
    this._query = null;
    this._url = new Url(request);
  }

  get user() {
    return this._user;
  }

  set user(value) {
    this._user = value;
  }

  get isSecure() {
    return this._url.protocol === 'https:';
  }

  get url() {
    return this._url;
  }

  get state() {
    return this._state;
  }

  set state(value) {
    this._state = value;
  }

  get language() {
    return this._language;
  }

  set language(value) {
    this._i18n.language = value;
    this._language = value;
  }

  get i18n() {
    return this._i18n;
  }

  isState(state) {
    return this.state.indexOf(state) === 0;
  }
}

class RuntimeContext {
  constructor(containerNodeId) {
    this._containerNodeId = containerNodeId;
    this._serverRenderContainerPattern = new RegExp(`(id=\"${containerNodeId}\"[^\>]*>?)(.*?)(<\/)`);
    this._middleware = [];
    if (this.isClient) {
      this._renderContainerObject = document.getElementById(this.containerNodeId);
      if (!this._renderContainerObject) {
        let mainDiv = document.createElement('div');
        mainDiv.id = 'main';
        this._renderContainerObject = mainDiv;
        document.getElementsByTagName('body')[0].appendChild(mainDiv);
      }
    } else {
      let html = require('__main_html');
      html = html.replace(/"((?:[^"]*?)\.(?:js|css))"/g, '"/$1"');
      this._renderContainerObject = html;
    }
    for (let mid of settings.MIDDLEWARE) {
      this._middleware.push(new mid.default()); //eslint-disable-line new-cap
    }
    if (this.isServer) {
      Error.prepareStackTrace = (error, stack) => {
        return stack;
      };
    }
  }

  getTrace(e) {
    let trace = '';
    let spacer = '';
    for (let frame of e.stack) {
      trace += `\n${spacer} ${frame.getTypeName()}.${frame.getFunctionName()} [line: ${frame.getLineNumber()}]`;
      spacer += '--';
    }
    return trace;
  }

  get middleware() {
    return this._middleware;
  }

  get containerNodeId() {
    return this._containerNodeId;
  }

  get serverRenderContainerPattern() {
    return this._serverRenderContainerPattern;
  }

  get renderContainerObject() {
    return this._renderContainerObject;
  }

  get isClient() {
    return typeof window !== 'undefined';
  }

  get isServer() {
    return !this.isClient;
  }

  get currentClientResponse() {
    return this._currentClientResponse;
  }

  set currentClientResponse(value) {
    this._currentClientResponse = value;
  }
}

export function _initContexts(settingsClass, containerNodeId) {
  settings = new settingsClass(); //eslint-disable-line new-cap
  runtime = new RuntimeContext(containerNodeId);
}
