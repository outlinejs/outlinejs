import React from 'react';
import ReactLink from 'react/lib/ReactLink';
import ReactStateSetters from 'react/lib/ReactStateSetters';
import Remarkable from 'remarkable';

export class BaseComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this._delegate = null;
  }

  static get contextTypes() {
    return {
      request: React.PropTypes.object,
      response: React.PropTypes.object
    };
  }

  rawMarkup(text) {
    var md = new Remarkable({ html: true, breaks: true });

    return md.render(text);
  }

  get request() {
    return this.props.__request || this.context.request;
  }

  get response() {
    return this.props.__response || this.context.response;
  }

  get i18n() {
    return this.request.i18n;
  }

  linkState(key) {
    return new ReactLink(
      this.state[key], ReactStateSetters.createStateKeySetter(this, key)
    );
  }

  setStateFromObject(obj) {
    var state = {};
    var proto = Reflect.getPrototypeOf(obj);
    var hasMethods = false;

    for (let name of Reflect.ownKeys(proto)) {
      if (Reflect.getOwnPropertyDescriptor(proto, name).get) {
        state[name] = obj[name];
        hasMethods = true;
      }
    }

    if (!hasMethods) {
      var protoBase = Reflect.getPrototypeOf(proto);

      for (let name of Reflect.ownKeys(protoBase)) {
        if (Reflect.getOwnPropertyDescriptor(protoBase, name).get) {
          state[name] = obj[name];
        }
      }
    }

    this.setState(state);
  }

  set delegate(value) {
    this._delegate = value;
    this.props.delegate = value;
  }

  get delegate() {
    if (this._delegate !== this.props.delegate) {
      this._delegate = this.props.delegate;
    }

    if (!this._delegate) {
      this._delegate = this;
    }

    return this._delegate;
  }
}
