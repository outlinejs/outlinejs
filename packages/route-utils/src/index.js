import {settings} from '@outlinejs/conf';

let _stateRouteMapping = {};

export class RouteUtils {
  static reverse(state, request, params = {}) {
    let language = request.i18n.language;
    // update the state with the current language
    state = language + ':' + state;

    let url = _stateRouteMapping[state](params); //eslint-disable-line no-shadow

    return `/${url}`;
  }

  static mapRoute(state, callback) {
    _stateRouteMapping[state] = callback;
  }

  static activeCssClass(request, state, cssClass = 'active') {
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

export function i18nUrl(state, controller) {
  let languages = settings.LANGUAGES;
  let urlDefinition = [];

  languages.forEach(function (language) {
    urlDefinition.push(new UrlDefinition(language + ':' + state, controller, true));
  });

  return urlDefinition;
}

export function include(router) {
  return new IncludeDefinition(router);
}
