import React from 'react';

import { RouteUtils } from '../../routers';
import { BaseComponent } from '../../components';

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
    var props = {};
    var { state, params, className, activeClassName, children, style, title } = this.props;

    props.href = RouteUtils.reverse(state, params, this.request);

    if (className) {
      props.className = className;
    }

    if (activeClassName) {
      if (this.request && this.request.absoluteUrl.endsWith(props.href)) {
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
