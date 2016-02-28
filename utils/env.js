import _env from '__outline_env';
export default class {
  static get(value) {
    return _env[value];
  }
}
