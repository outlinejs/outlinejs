'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _contexts = require('../contexts');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    _classCallCheck(this, _class);
  }

  _createClass(_class, [{
    key: 'urlStrategy',
    value: function urlStrategy(request) {
      // cleanup language value
      var language = null;

      if (_contexts.runtime.isServer) {
        language = request.url.split('/')[1].toLowerCase().trim();
      } else {
        language = window.location.pathname.split('/')[1].toLowerCase().trim();
      }

      // cleanup array elements converting to lowercase and trim it
      var supportedLanguages = _contexts.settings.LANGUAGES.map(function (item) {
        return item.toLowerCase().trim();
      });

      // check if current value of language is supported
      var languageIndex = supportedLanguages.indexOf(language);

      if (languageIndex !== -1) {
        return _contexts.settings.LANGUAGES[languageIndex];
      }

      // the strategy has fail try with next strategy
      return null;
    }
  }, {
    key: 'qsStrategy',
    value: function qsStrategy(request) {
      var parsedQueryString = request.url.query;

      // check if query string parameter language exist
      if (parsedQueryString.language) {
        // cleanup language value
        var language = parsedQueryString.language.toLowerCase().trim();

        // cleanup array elements converting to lowercase and trim it
        var supportedLanguages = _contexts.settings.LANGUAGES.map(function (item) {
          return item.toLowerCase().trim();
        });

        // check if current value of language is supported
        var languageIndex = supportedLanguages.indexOf(language);

        if (languageIndex !== -1) {
          return _contexts.settings.LANGUAGES[languageIndex];
        }
      }

      // the strategy has fail try with next strategy
      return null;
    }
  }, {
    key: 'cookieStrategy',
    value: function cookieStrategy(request) {
      if (_contexts.runtime.isServer) {
        var cookie = require('cookie');
        var cookies = cookie.parse(request.headers.cookie || '');

        // check if language cookie exist
        if (cookies.language) {
          // cleanup language value
          var language = cookies.language.toLowerCase().trim();

          // cleanup array elements converting to lowercase and trim it
          var supportedLanguages = _contexts.settings.LANGUAGES.map(function (item) {
            return item.toLowerCase().trim();
          });

          // check if current value of language is supported
          var languageIndex = supportedLanguages.indexOf(language);

          if (languageIndex !== -1) {
            return _contexts.settings.LANGUAGES[languageIndex];
          }
        }
      } else {
        var _cookie = require('js-cookie');

        if (_cookie.get('language')) {
          return _cookie.get('language');
        }
      }

      // the strategy has fail try with next strategy
      return null;
    }
  }, {
    key: 'headerStrategy',
    value: function headerStrategy(request) {
      if (_contexts.runtime.isServer) {
        var acceptLanguage = require('accept-language');
        var language = null;

        // fix to avoid accept-language to return the first supported
        // language present in the array
        var supportedLanguages = _contexts.settings.LANGUAGES;
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
  }, {
    key: 'defaultStrategy',
    value: function defaultStrategy(request) {
      // eslint-disable-line no-unused-vars
      return _contexts.settings.DEFAULT_LANGUAGE;
    }
  }, {
    key: 'processRequest',
    value: function processRequest(request) {
      // define strategies priority
      var availableStrategies = [this.urlStrategy, this.qsStrategy, this.cookieStrategy, this.headerStrategy, this.defaultStrategy];

      return new Promise(function (resolve) {
        // run available strategies to handle the current request language
        for (var index = 0; index < availableStrategies.length; index++) {
          var strategy = availableStrategies[index];
          var strategyResult = strategy(request);

          //console.log(strategy, strategyResult);

          if (strategyResult !== null) {
            request.language = strategyResult;

            break;
          }
        }

        resolve();
      });
    }
  }, {
    key: 'processResponse',
    value: function processResponse(request, response) {
      return new Promise(function (resolve) {

        if (_contexts.runtime.isServer) {
          response.setHeader('Content-Language', request.language);
          response.setHeader('Set-Cookie', ['language=' + request.language + '; Path=/']);
        }

        resolve();
      });
    }
  }]);

  return _class;
}();

exports.default = _class;