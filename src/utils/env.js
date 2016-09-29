let _env;

try {
  _env = require('__outline_env');
} catch (ex) {
  _env = {};
}

export default class {
  static get(value) {
    return _env[value];
  }
}
