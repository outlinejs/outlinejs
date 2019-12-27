import Jed from 'jed';

global.__ojsTranslationDictionaries = {};

export default class {
  constructor() {
    this._language = null;
  }

  static addTranslation(translation) {
    const trans = new Jed(translation);
    // patch language value with _ (separator used by gettext)
    // instead of - (separator used by W3C)
    const lang = trans.options.locale_data.messages[''].lang.replace('_', '-');
    global.__ojsTranslationDictionaries[lang] = trans;
  }

  get language() {
    return this._language;
  }

  set language(value) {
    if (!global.__ojsTranslationDictionaries[value]) {
      console.warn(`Language with code ${value} is not available.`);
    }
    this._language = value;
  }

  gettext(msgid) {
    let currentDictionary = global.__ojsTranslationDictionaries[this._language];
    if (currentDictionary) {
      return currentDictionary.gettext(msgid);
    }
    return msgid;
  }

  ngettext(singular, plural, count) {
    let currentDictionary = global.__ojsTranslationDictionaries[this._language];
    if (currentDictionary) {
      return currentDictionary.ngettext(singular, plural, count);
    }
    return count === 1 ? singular : plural;
  }

  gettext_noop(msgid) { //eslint-disable-line camelcase
    return msgid;
  }

  pgettext(context, msgid) {
    let currentDictionary = global.__ojsTranslationDictionaries[this._language];
    if (currentDictionary) {
      return currentDictionary.pgettext(context, msgid);
    }
    return msgid;
  }

  npgettext(context, singular, plural, count) {
    let currentDictionary = global.__ojsTranslationDictionaries[this._language];
    if (currentDictionary) {
      return currentDictionary.npgettext(context, singular, plural, count);
    }
    return count === 1 ? singular : plural;
  }
}
