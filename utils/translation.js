import Jed from 'jed';
import { global } from '../contexts';
import http from 'http';

let dictionaries = {};

export function gettext(msgid) {
  var currentDictionary = dictionaries[global.language];
  if (currentDictionary) {
    return currentDictionary.gettext(msgid);
  }
  return msgid;
}

export function ngettext(singular, plural, count) {
  var currentDictionary = dictionaries[global.language];
  if (currentDictionary) {
    return currentDictionary.ngettext(singular, plural, count);
  }
  return count === 1 ? singular : plural;
}

export function gettext_noop(msgid) { //eslint-disable-line camelcase
  return msgid;
}

export function pgettext(context, msgid) {
  var currentDictionary = dictionaries[global.language];
  if (currentDictionary) {
    return currentDictionary.pgettext(context, msgid);
  }
  return msgid;
}

export function npgettext(context, singular, plural, count) {
  var currentDictionary = dictionaries[global.language];
  if (currentDictionary) {
    return currentDictionary.npgettext(context, singular, plural, count);
  }
  return count === 1 ? singular : plural;
}

export function activate(language) {
  //TODO: be tolerant with language value
  return new Promise((resolve) => {
    if (dictionaries[language]) {
      global.language = language;
      resolve();
    } else {
      var req = http.request(`/locale/${language}.json`, (res) => {
        var responseText = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          responseText += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300 || res.statusCode === 304) {
            dictionaries[language] = new Jed(JSON.parse(responseText));
            global.language = language;
          }
          resolve();
        });
      });
      req.on('error', () => {
        resolve();
      });
      req.end();
    }
  });
}
