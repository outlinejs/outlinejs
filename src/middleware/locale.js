import { runtime, settings } from '../contexts';

export default class {
  urlStrategy(request) {
    // cleanup language value
    let language = null;

    if (runtime.isServer) {
      language = request.url.split('/')[1].toLowerCase().trim();
    } else {
      language = window.location.pathname.split('/')[1].toLowerCase().trim();
    }

    // cleanup array elements converting to lowercase and trim it
    let supportedLanguages = settings.LANGUAGES.map((item) => {
      return item.toLowerCase().trim();
    });

    // check if current value of language is supported
    let languageIndex = supportedLanguages.indexOf(language);

    if (languageIndex !== -1) {
      return settings.LANGUAGES[languageIndex];
    }

    // the strategy has fail try with next strategy
    return null;
  }

  qsStrategy(request) {
    let qs = require('qs');
    let parsedQueryString = qs.parse(request.query);

    // check if query string parameter language exist
    if (parsedQueryString.language) {
      // cleanup language value
      let language = parsedQueryString.language.toLowerCase().trim();

      // cleanup array elements converting to lowercase and trim it
      let supportedLanguages = settings.LANGUAGES.map((item) => {
        return item.toLowerCase().trim();
      });

      // check if current value of language is supported
      let languageIndex = supportedLanguages.indexOf(language);

      if (languageIndex !== -1) {
        return settings.LANGUAGES[languageIndex];
      }
    }

    // the strategy has fail try with next strategy
    return null;
  }

  cookieStrategy(request) {
    if (runtime.isServer) {
      let cookie = require('cookie');
      let cookies = cookie.parse(request.headers.cookie || '');

      // check if language cookie exist
      if (cookies.language) {
        // cleanup language value
        let language = cookies.language.toLowerCase().trim();

        // cleanup array elements converting to lowercase and trim it
        let supportedLanguages = settings.LANGUAGES.map((item) => {
          return item.toLowerCase().trim();
        });

        // check if current value of language is supported
        let languageIndex = supportedLanguages.indexOf(language);

        if (languageIndex !== -1) {
          return settings.LANGUAGES[languageIndex];
        }
      }
    } else {
      let cookie = require('js-cookie');

      if (cookie.get('language')) {
        return cookie.get('language');
      }
    }

    // the strategy has fail try with next strategy
    return null;
  }

  headerStrategy(request) {
    if (runtime.isServer) {
      let acceptLanguage = require('accept-language');
      let language = null;

      // fix to avoid accept-language to return the first supported
      // language present in the array
      let supportedLanguages = settings.LANGUAGES;
      supportedLanguages.unshift(null);

      // add suported languages to accept-language module
      acceptLanguage.languages(supportedLanguages);

      // parse current request header and match supported languages
      language = acceptLanguage.get(request.headers['accept-language']);

      if (language !== null) {
        return language;
      }
    }

    // the strategy has fail try with next strategy
    return null;
  }

  defaultStrategy(request) { // eslint-disable-line no-unused-vars
    return settings.DEFAULT_LANGUAGE;
  }

  preControllerInit(request, response) {
    // define strategies priority
    var availableStrategies = [this.urlStrategy, this.qsStrategy, this.cookieStrategy, this.headerStrategy, this.defaultStrategy];

    return new Promise((resolve) => {
      // run available strategies to handle the current request language
      for (var index = 0; index < availableStrategies.length; index++) {
        let strategy = availableStrategies[index];
        let strategyResult = strategy(request);

        //console.log(strategy, strategyResult);

        if (strategyResult !== null) {
          request.language = strategyResult;

          if (runtime.isServer) {
            response.setHeader('Content-Language', strategyResult);
            response.setHeader('Set-Cookie', ['language=' + strategyResult + '; Path=/']);
          }

          break;
        }
      }

      resolve();
    });
  }
}
