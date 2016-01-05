import { MIDDLEWARE } from '../settings';

class GlobalContext {
  constructor() {
    this._user = null;
  }

  get user() {
    return this._user;
  }

  set user(value) {
    this._user = value;
  }
}

class RuntimeContext {
  constructor() {
    this._middleware = [];

    var bulk = require('bulk-require');
    var sections = bulk(__dirname + '/../', ['./**/middleware.js']);
    for (var mid of MIDDLEWARE) {
      this._middleware.push(new (sections[mid].middleware()));
    }

  }

  get middleware() {
    return this._middleware;
  }
}

let _globalContext = new GlobalContext();
let _runtimeContext = new RuntimeContext();

export function getGlobalContext() {
  return _globalContext;
}

export function getRuntimeContext() {
  return _runtimeContext;
}
