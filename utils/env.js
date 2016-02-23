import _env from '__outlineEnv';
export default class {
  static get(value) {
    return _env[value];
  }
}
