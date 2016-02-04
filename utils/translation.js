import $ from 'jquery';
import Jed from 'jed';
import { global } from '../contexts';

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
      $.ajax(`/locale/${language}.json`, {
        success: (data) => {
          dictionaries[language] = new Jed(data);
          global.language = language;
        },
        complete: () => {
          resolve();
        }
      });
    }
  });
}
