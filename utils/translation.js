export function gettext(msgid) {
  return msgid;
}

export function ngettext(singolar, plural, count) {
  return count === 1 ? singolar : plural;
}

export function gettext_noop(msgid) { //eslint-disable-line camelcase
  return msgid;
}

export function pgettext(context, msgid) {
  return msgid;
}

export function npgettext(context, singolar, plural, count) {
  return count === 1 ? singolar : plural;
}
