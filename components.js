import React from 'react';
import ReactLink from 'react/lib/ReactLink';
import ReactStateSetters from 'react/lib/ReactStateSetters';


export class BaseComponent extends React.Component {
  constructor(...args) {
    super(...args);
    this._controller = this;
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

  get controller() {
    return this.props.controller || this._controller;
  }
}

