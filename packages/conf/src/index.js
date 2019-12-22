export let settings = new Proxy({}, {
  get(target, name) {
    return global.__ojsSettings[name];
  }
});

export class BaseSettings {
  get MIDDLEWARE() {
    return [];
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

export function _init(settingsClass) {
  global.__ojsSettings = new settingsClass(); //eslint-disable-line new-cap
}
