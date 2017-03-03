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

/**
 * Class to parse and convert a string url (https://user:password@github.com:8000/outlinejs/outlinejs?q=string#hash)
 * from current request in structured components.
 */
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

      // class URL is Experimental ...
      // so use old url.parse
      this._serverUrl = url.parse(`${protocol}//${this._request.headers.host.replace(/:80$/, '')}${this._request.url}`);
    }
  }

  /**
   * A string containing the entire URL.
   * For example: 'https://xpicio:123456@github.com:8000/outlinejs/outlinejs?q=string#hash'
   */
  get href() {
    if (runtime.isClient) {
      return this._clientUrl.href;
    } else {
      return this._serverUrl.href;
    }
  }

  /**
   * The protocol string identifies the URL's lower-cased protocol scheme.
   * For example: 'https:'
   */
  get protocol() {
    if (runtime.isClient) {
      return this._clientUrl.protocol;
    } else {
      return this._serverUrl.protocol;
    }
  }

  /**
   * A string containing the username specified before the domain name.
   * For example: 'xpicio:'
   */
  get username() {
    if (runtime.isClient) {
      return this._clientUrl.username;
    } else {
      let username = '';

      if (this._serverUrl.username) {
        username = this._serverUrl.username.split(':')[0];
      }

      return username || '';
    }
  }

  /**
   * A string containing the password specified before the domain name.
   * For example: '123456:'
   */
  get password() {
    if (runtime.isClient) {
      return this._clientUrl.password;
    } else {
      let password = '';

      if (this._serverUrl.password) {
        password = this._serverUrl.password.split(':')[1];
      }

      return password || '';
    }
  }

  /**
   * The hostname property is the lower-cased host name portion of the host component without the port included.
   * For example: 'github.com'
   */
  get hostname() {
    if (runtime.isClient) {
      return this._clientUrl.hostname;
    } else {
      return this._serverUrl.hostname;
    }
  }

  /**
   * A string containing the port portion of the host component.
   * For example: '8000'
   */
  get port() {
    if (runtime.isClient) {
      return this._clientUrl.port;
    } else {
      return this._serverUrl.port;
    }
  }

  /**
   * A string containing the canonical form of the origin of the specific url.
   * For example: 'https://github.com'
   */
  get origin() {
    if (runtime.isClient) {
      return this._clientUrl.origin;
    } else {
      return `${this._serverUrl.protocol}//${this._serverUrl.hostname}`;
    }
  }

  /**
   * A string containing an initial '/' followed by the path of the url.
   * For example: '/outlinejs/outlinejs'
   */
  get pathname() {
    if (runtime.isClient) {
      return this._clientUrl.pathname;
    } else {
      return this._serverUrl.pathname;
    }
  }

  /**
   * A string containing a '?' followed by the parameters of the url, also known as "querystring".
   * For example: '?q=string'
   */
  get search() {
    if (runtime.isClient) {
      return this._clientUrl.search;
    } else {
      return this._serverUrl.search;
    }
  }

  /**
   * An object containing the parsed parameters of the url.
   * For example: '{ q: 'string' }'
   */
  get query() {
    let qs = require('qs');

    if (runtime.isClient) {
      return qs.parse(this._clientUrl.search);
    } else {
      return qs.parse(this._serverUrl.query);
    }
  }

  /**
   * A string containing the path property that is a concatenation of the pathname and search components.
   * For example: '/outlinejs/outlinejs?q=string'
   */
  get path() {
    if (runtime.isClient) {
      return `${this._clientUrl.pathname}${this._clientUrl.search}`;
    } else {
      return this._serverUrl.path;
    }
  }

  /**
   * A string containing a '#' followed by the fragment identifier of the url.
   */
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
