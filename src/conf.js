export class BaseSettings {
  get MIDDLEWARE() {
    return [require('./middleware/locale')];
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
    return [this.DEFAULT_LANGUAGE, 'it-IT'];
  }
}
