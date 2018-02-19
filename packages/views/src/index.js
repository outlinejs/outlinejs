import { BaseComponent } from '@outlinejs/components';
import React from 'react';
import PropTypes from 'prop-types';

export class BaseView extends BaseComponent {
  static get childContextTypes() {
    return {
      request: PropTypes.object,
      response: PropTypes.object
    };
  }

  getChildContext() {
    return this.props.__context || {
      request: this.props.__request,
      response: this.props.__response
    };
  }
}

export class BaseLayoutView extends BaseView {
  renderContent() {
    var Content = this.props.content;
    return <Content { ...this.props.contentProps } delegate={ this.delegate } __context={this.getChildContext()} />;
  }
}
