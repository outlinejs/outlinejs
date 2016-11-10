import React from 'react';
import Helmet from 'react-helmet'; // eslint-disable-line no-unused-vars

import { BaseComponent } from '../../components';

export class Head extends BaseComponent {
  render() {
    return <Helmet {...this.props} />;
  }
}
