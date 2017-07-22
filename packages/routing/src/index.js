let _stateRouteMapping = {};

export class Utils {
  static reverse(state, request, params = {}) {
    let callback = _stateRouteMapping[state];
    if (!callback) {
      throw `State '${state}' is not registered.`;
    }
    let reversedUrl = callback(params);
    if (reversedUrl === '/') {
      reversedUrl = '';
    }
    return `/${reversedUrl}`;
  }

  static mapRoute(state, callback) {
    _stateRouteMapping[state] = callback;
  }

  static activeCssClass(state, request, cssClass = 'active') {
    if (request && request.isState(state)) {
      return cssClass;
    }
  }
}

class UrlDefinition {
  constructor(state, controller) {
    this._state = state;
    this._controller = controller;
  }

  get state() {
    return this._state;
  }

  get controller() {
    return this._controller;
  }
}

export class IncludeDefinition {
  constructor(router) {
    this._router = router;
  }

  get router() {
    return this._router;
  }
}

export function url(state, controller) {
  let urlDefinition = [];
  urlDefinition.push(new UrlDefinition(state, controller, true));
  return urlDefinition;
}

export function include(router) {
  return new IncludeDefinition(router);
}
