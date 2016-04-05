import Translation from './utils/translation';
import querystring from 'querystring';
import url from 'url';
import Backbone from 'backbone';
import { backboneSync } from './utils/patches/backbone';
export let runtime = null;
export let settings = null;

export class RequestContext {
  constructor(request) {
    this._user = null;
    this._state = null;
    this._language = null;
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
      var location = window.history.location || window.location;
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
      var location = window.history.location || window.location;
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
    } else {
      var html = require('__main_html');
      html = html.replace(/"((?:[^"]*?)\.(?:js|css))"/g, '"/$1"');
      this._renderContainerObject = html;
    }
    for (var mid of settings.MIDDLEWARE) {
      this._middleware.push(new mid.default()); //eslint-disable-line new-cap
    }
    if (this.isServer) {
      Error.prepareStackTrace = (error, stack) => {
        return stack;
      };
    }
  }

  getTrace(e) {
    var trace = '';
    var spacer = '';
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

  get backboneSyncFunction() {
    return Backbone.sync;
  }

  set backboneSyncFunction(value) {
    Backbone.sync = value;
  }
}

export function _initContexts(settingsClass, containerNodeId) {
  settings = new settingsClass(); //eslint-disable-line new-cap
  runtime = new RuntimeContext(containerNodeId);
}
