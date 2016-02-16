import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import React from 'react'; //eslint-disable-line no-unused-vars
import { runtime } from './contexts';

let safeStringifyRegExScript = new RegExp('<\/script', 'g');
let safeStringifyRegExComment = new RegExp('<!--', 'g');

function safeStringify(obj) {
  return JSON.stringify(obj).replace(safeStringifyRegExScript, '<\\/script').replace(safeStringifyRegExComment, '<\\!--');
}

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
      if (window.VIEW_PROPS) {
        //re-sync server rendered props
        ReactDOM.render(<View {...window.VIEW_PROPS} delegate={this} />, runtime.renderContainerObject);
        window.VIEW_PROPS = null;
      }
      this._viewInstance = ReactDOM.render(<View {...context} delegate={this} />, runtime.renderContainerObject);
    } else {
      //render react component
      var html = runtime.renderContainerObject.replace(runtime.serverRenderContainerPattern, (match, pre, inside, post) => {
        return pre + ReactDOMServer.renderToString(<View {...context} delegate={this} />) + post;
      });
      //render react component props
      var propScript = ReactDOMServer.renderToStaticMarkup(React.DOM.script({dangerouslySetInnerHTML: {__html:
        `var VIEW_PROPS = ${safeStringify(context)};`
      }}));
      html = html.replace('<head>', `<head>${propScript}`);
      //output to http response
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
    if (runtime.isClient && window.VIEW_PROPS) {
      //re-sync server rendered props (content is not a serializable prop ... so is not available in serialized VIEW_PROPS)
      window.VIEW_PROPS.content = this._contentView;
    }
    super.render(mergedContext);
  }
}
