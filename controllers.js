import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import React from 'react'; //eslint-disable-line no-unused-vars
import { runtime } from './contexts';

export class BaseController {
  constructor(req, res) {
    this._view = null;
    this._viewInstance = null;
    this.res = res;
    this.req = req;
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
    if (runtime.isClient) {
      this._viewInstance = ReactDOM.render(<View {...context} delegate={this} />, runtime.renderContainerObject);
    } else {
      var html = runtime.renderContainerObject.replace(runtime.serverRenderContainerPattern, (match, pre, inside, post) => {
        return pre + ReactDOMServer.renderToString(<View {...context} delegate={this} />) + post;
      });
      this.res.writeHead(200, {'Content-Type': 'text/html'});
      this.res.end(html);
    }
  }
}

export class BaseLayoutController extends BaseController {
  // in base layout view
  // layout view correspond to BaseController view
  // and view correspond to the view to set in content property
  constructor(req, res) {
    super(req, res);
    this._contentView = null;
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
