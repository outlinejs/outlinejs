import ReactDOM from 'react-dom';
import React from 'react'; //eslint-disable-line no-unused-vars
import { runtime } from './contexts';

export class BaseController {
  constructor(view = null) {
    this._view = view;
    this._viewInstance = null;
  }

  set view(value) {
    this._view = value;
  }

  get view() {
    return this._view;
  }

  get viewInstance() {
    return this._viewInstance;
  }

  static get loginRequired() {
    return true;
  }

  render(context = {}) {
    var View = this._view; //eslint-disable-line no-unused-vars
    this._viewInstance = ReactDOM.render(<View {...context} delegate={this} />, runtime.containerNode);
  }
}

export class BaseLayoutController extends BaseController {
  // in base layout view
  // layout view correspond to BaseController view
  // and view correspond to the view to set in content property
  constructor(view = null, layoutView = null) {
    super(layoutView);
    this._contentView = view;
  }

  set layoutView(value) {
    this._view = value;
  }
  get layoutView() {
    return this._view;
  }

  set view(value) {
    this._contentView = value;
  }
  get view() {
    return this._contentView;
  }

  get viewInstance() {
    return super.viewInstance.refs.contentView;
  }

  render(context = {}) {
    var mergedContext = {};
    mergedContext.contentProps = context;
    mergedContext.content = this._contentView;
    super.render(mergedContext);
  }
}
