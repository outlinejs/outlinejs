export class BaseSettings {
  get MIDDLEWARE() {
    return [];
  }
  get LOGIN_STATE() {
    return 'login';
  }
  get APPEND_SLASH() {
    return true;
  }
}
