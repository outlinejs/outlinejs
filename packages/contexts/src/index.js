import querystring from 'querystring';
import url from 'url';
import Translation from '@outlinejs/translation';
import {settings} from '@outlinejs/conf';
import {Utils as RouteUtils} from '@outlinejs/routing';

export let runtime = null;

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
  }

  get response() {
    return this._response;
  }

  get request() {
    return this._request;
  }

  navigate(to, params = {}) {
    let destinationUrl;
    try {
      destinationUrl = RouteUtils.reverse(to, this.request, params);
    } catch (ex) {
      destinationUrl = to;

      if (runtime.isClient) {
        // check if it's an absolute url
        if (url.parse(destinationUrl).protocol) {
          window.location.href = destinationUrl;
          return;
        }
      }
    }

    if (runtime.isClient) {
      if (settings.ROUTING_USE_FRAGMENT) {
        let hasher = require('hasher');
        hasher.prependHash = '';
        hasher.setHash(destinationUrl);
      } else {
        if (settings.SERVER_SIDE_LINK_ONLY) {
          window.location.href = destinationUrl;
        } else {
          let history = require('html5-history-api');
          history.pushState(null, null, destinationUrl);
          window.navigateEventEmitter.emit('navigate', destinationUrl);
        }
      }
    } else {
      this.response.writeHead(302, {Location: destinationUrl});
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

export class RequestContext extends DecorableContext {
  constructor(request) {
    super();
    this._user = null;
    this._state = null;
    this._language = settings.DEFAULT_LANGUAGE;
    this._i18n = new Translation();
    this._request = request;
    this._query = null;
  }

  get user() {
    return this._user;
  }

  set user(value) {
    this._user = value;
  }

  get isSecure() {
    if (runtime.isClient) {
      require('html5-history-api');
      let location = window.history.location || window.location;
      return location.href.indexOf('https://') === 0;
    } else {
      if (this._request.connection.encrypted || this._request.headers['X-Forwarded-Proto'] === 'https') {
        return true;
      }
      return false;
    }
  }

  get absoluteUrl() {
    if (runtime.isClient) {
      require('html5-history-api');
      let location = window.history.location || window.location;
      return location.href;
    } else {
      return `${this.isSecure ? 'https' : 'http'}://${this._request.headers.host.replace(/:80$/, '')}${this._request.url}`;
    }
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

  get query() {
    if (!this._query) {
      this._query = querystring.decode(url.parse(this.absoluteUrl).query);
    }
    return this._query;
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

export function _init(containerNodeId) {
  runtime = new RuntimeContext(containerNodeId);
}
