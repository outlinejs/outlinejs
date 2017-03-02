import React from 'react';
import Remarkable from 'remarkable';
import Helmet from 'react-helmet';
import { RouteUtils } from '@outlinejs/routers';


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
    let md = new Remarkable({html: true, breaks: true});
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

export class Head extends BaseComponent {
  render() {
    return <Helmet {...this.props} />;
  }
}


export class Link extends BaseComponent {
  static isLeftClickEvent(event) {
    return event.button === 0;
  }

  static isModifiedEvent(event) {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
  }

  handleClick(event) {
    let allowTransition = true;

    if (this.props.onClick) {
      this.props.onClick(event);
    }

    if (Link.isModifiedEvent(event) || !Link.isLeftClickEvent(event)) {
      return;
    }

    if (event.defaultPrevented === true) {
      allowTransition = false;
    }

    // If target prop is set (e.g. to "_blank") let browser handle link.
    if (this.props.target) {
      if (!allowTransition) {
        event.preventDefault();
      }
      return;
    }

    event.preventDefault();

    if (allowTransition) {
      const { state, params } = this.props;

      this.response.navigate(state, params);
    }
  }

  render() {
    let props = {};
    let { state, params, className, activeClassName, children, style, title } = this.props;

    props.href = RouteUtils.reverse(state, params, this.request);

    if (className) {
      props.className = className;
    }

    if (activeClassName) {
      if (this.request && this.request.url.href.endsWith(props.href)) {
        if (className) {
          props.className += ` ${activeClassName}`;
        } else {
          props.className = activeClassName;
        }
      }
    }

    if (style) {
      props.style = style;
    }

    if (title) {
      props.title = title;
    }

    props.children = children;

    return <a {...props} onClick={ this.handleClick.bind(this) } />;
  }
}
