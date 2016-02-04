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
  constructor() {
    this._middleware = [];
    for (var mid of settings.MIDDLEWARE) {
      this._middleware.push(new mid.default()); //eslint-disable-line new-cap
    }
  }

  get middleware() {
    return this._middleware;
  }
}

export function _initContexts(settingsInstance) {
  settings = settingsInstance;
  global = new GlobalContext();
  runtime = new RuntimeContext();
}
