let _globalContext = null;
let _runtimeContext = null;
export let settings = null;

class GlobalContext {
  constructor() {
    this._user = null;
    this._state = null;
  }

  get user() {
    return this._user;
  }

  set user(value) {
    this._user = value;
  }

  get currentState() {
    return this._state;
  }

  set currentState(value) {
    this._state = value;
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
  _globalContext = new GlobalContext();
  _runtimeContext = new RuntimeContext();
}

export function globalContext() {
  return _globalContext;
}

export function runtimeContext() {
  return _runtimeContext;
}
