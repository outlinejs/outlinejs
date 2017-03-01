import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import React from 'react'; // eslint-disable-line no-unused-vars
import Helmet from 'react-helmet';

import { runtime } from '@outlinejs/contexts';

let safeStringifyRegExScript = new RegExp('<\/script', 'g');
let safeStringifyRegExComment = new RegExp('<!--', 'g');

function safeStringify(obj) {
  return JSON.stringify(obj).replace(safeStringifyRegExScript, '<\\/script').replace(safeStringifyRegExComment, '<\\!--');
}

export class BaseController {
  constructor(request, response) {
    this._viewInstance = null;
    this.request = request;
    this.response = response;
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

  get i18n() {
    return this.request.i18n;
  }

  static get loginRequired() {
    return true;
  }

  get serverSideRenderOnly() {
    return false;
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
    var View = this.getViewForRendering(); // eslint-disable-line

    // it's the root view, remove the child context request
    if (runtime.isClient) {
      if (!this.serverSideRenderOnly && runtime.currentClientResponse === this.response) {
        this._viewInstance = ReactDOM.render(<View {...context} delegate={this} __request={this.request} __response={this.response} />, runtime.renderContainerObject);
      }
    } else {
      try {
        // render react component
        var html = runtime.renderContainerObject.replace(runtime.serverRenderContainerPattern, (match, pre, inside, post) => {
          return pre + ReactDOMServer.renderToString(<View {...context} delegate={this} __request={this.request} __response={this.response} />) + post;
        });

        // render react component props
        var propScript = ReactDOMServer.renderToStaticMarkup(React.DOM.script({
          dangerouslySetInnerHTML: {
            __html: `var VIEW_PROPS = ${safeStringify(context)};`
          }
        }));
        html = html.replace('<head>', `<head>${propScript}`);

        let head = Helmet.rewind();

        html = html.replace('<html>', `<html ${head.htmlAttributes.toString()}>`);
        html = html.replace('<head>', `<head>${head.title.toString()}`);
        html = html.replace('<head>', `<head>${head.meta.toString()}`);
        html = html.replace('<head>', `<head>${head.link.toString()}`);
        html = html.replace('<head>', `<head>${head.noscript.toString()}`);

        // output to http response
        this.response.writeHead(200, {'Content-Type': 'text/html'});
        this.response.end(html);
      } catch (ex) {
        this.response.error(ex);
      }
    }
  }
}

export class BaseLayoutController extends BaseController {
  // in base layout view
  // layout view correspond to BaseController view
  // and view correspond to the view to set in content property

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
