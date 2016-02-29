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
    this._viewInstance = null;
    this.res = res;
    this.req = req;
  }

  get view() {
    throw 'NotImplemented. The \'view\' property is not implemented!';
  }

  get viewInstance() {
    return this._viewInstance;
  }

  get isViewRendered() {
    return this.viewInstance !== null;
  }

  static get loginRequired() {
    return true;
  }

  getViewForRendering() {
    return this.view;
  }

  reconcileWithServer() {
    if (runtime.isClient && window.VIEW_PROPS) {
      this.render(window.VIEW_PROPS);
      window.VIEW_PROPS = null;
    }
  }

  render(context = {}) {
    var View = this.getViewForRendering(); //eslint-disable-line
    if (runtime.isClient) {
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
  }

  get layoutView() {
    throw 'NotImplemented. The \'layoutView\' property is not implemented!';
  }

  getViewForRendering() {
    return this.layoutView;
  }

  reconcileWithServer() {
    if (runtime.isClient && window.VIEW_PROPS) {
      //re-sync server rendered props (content is not a serializable prop ... so is not available in serialized VIEW_PROPS)
      window.VIEW_PROPS.content = this.view;
      super.render(window.VIEW_PROPS);
      window.VIEW_PROPS = null;
    }
  }

  render(context = {}) {
    var mergedContext = {};
    mergedContext.contentProps = context;
    mergedContext.content = this.view;
    super.render(mergedContext);
  }
}