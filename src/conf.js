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
}
