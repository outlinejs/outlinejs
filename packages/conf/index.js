export class BaseSettings {
  get MIDDLEWARE() {
    return [require('@outlinejs/middleware').locale];
  }

  get LOGIN_STATE() {
    return 'login';
  }

  get ROUTING_USE_FRAGMENT() {
    return false;
  }

  get APPEND_SLASH() {
    return true;
  }

  get SERVER_SIDE_LINK_ONLY() {
    return false;
  }

  get DEFAULT_LANGUAGE() {
    return 'en-US';
  }

  get LANGUAGES() {
    //TODO: add missing languages
    return [this.DEFAULT_LANGUAGE, 'it-IT'];
  }
}


let _env;

try {
  _env = require('__outline_env');
} catch (ex) {
  _env = {};
}

if (!_env) {
  _env = {};
}

export class Env {
  static get(value) {
    return _env[value];
  }
}
