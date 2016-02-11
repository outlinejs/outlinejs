export let global = null;
export let runtime = null;
export let settings = null;

class GlobalContext {
  constructor() {
    this._user = null;
    this._state = null;
    this._language = null;
  }

  get user() {
    return this._user;
  }

  set user(value) {
    this._user = value;
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
    this._language = value;
  }
}

class RuntimeContext {
  constructor(containerNode) {
    this._containerNode = containerNode;
    this._middleware = [];
    for (var mid of settings.MIDDLEWARE) {
      this._middleware.push(new mid.default()); //eslint-disable-line new-cap
    }
  }

  get middleware() {
    return this._middleware;
  }

  get containerNode() {
    return this._containerNode;
  }

  get isClient() {
    return typeof window !== 'undefined';
  }

  get isServer() {
    return !this.isClient;
  }
}

export function _initContexts(settingsInstance, containerNode) {
  settings = settingsInstance;
  global = new GlobalContext();
  runtime = new RuntimeContext(containerNode);
}
