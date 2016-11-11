'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseLayoutController = exports.BaseController = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // eslint-disable-line no-unused-vars


var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactHelmet = require('react-helmet');

var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

var _contexts = require('./contexts');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var safeStringifyRegExScript = new RegExp('<\/script', 'g');
var safeStringifyRegExComment = new RegExp('<!--', 'g');

function safeStringify(obj) {
  return JSON.stringify(obj).replace(safeStringifyRegExScript, '<\\/script').replace(safeStringifyRegExComment, '<\\!--');
}

var BaseController = exports.BaseController = function () {
  function BaseController(request, response) {
    _classCallCheck(this, BaseController);

    this._viewInstance = null;
    this.request = request;
    this.response = response;
  }

  _createClass(BaseController, [{
    key: 'getViewForRendering',
    value: function getViewForRendering() {
      return this.view;
    }
  }, {
    key: 'reconcileWithServer',
    value: function reconcileWithServer() {
      if (_contexts.runtime.isClient && window.VIEW_PROPS) {
        this.render(window.VIEW_PROPS);
        window.VIEW_PROPS = null;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var View = this.getViewForRendering(); // eslint-disable-line

      // it's the root view, remove the child context request
      if (_contexts.runtime.isClient) {
        if (!this.serverSideRenderOnly && _contexts.runtime.currentClientResponse === this.response) {
          this._viewInstance = _reactDom2.default.render(_react2.default.createElement(View, _extends({}, context, { delegate: this, __request: this.request, __response: this.response })), _contexts.runtime.renderContainerObject);
        }
      } else {
        try {
          // render react component
          var html = _contexts.runtime.renderContainerObject.replace(_contexts.runtime.serverRenderContainerPattern, function (match, pre, inside, post) {
            return pre + _server2.default.renderToString(_react2.default.createElement(View, _extends({}, context, { delegate: _this, __request: _this.request, __response: _this.response }))) + post;
          });

          // render react component props
          var propScript = _server2.default.renderToStaticMarkup(_react2.default.DOM.script({
            dangerouslySetInnerHTML: {
              __html: 'var VIEW_PROPS = ' + safeStringify(context) + ';'
            }
          }));
          html = html.replace('<head>', '<head>' + propScript);

          var head = _reactHelmet2.default.rewind();

          html = html.replace('<html>', '<html ' + head.htmlAttributes.toString() + '>');
          html = html.replace('<head>', '<head>' + head.title.toString());
          html = html.replace('<head>', '<head>' + head.meta.toString());
          html = html.replace('<head>', '<head>' + head.link.toString());
          html = html.replace('<head>', '<head>' + head.noscript.toString());

          // output to http response
          this.response.writeHead(200, { 'Content-Type': 'text/html' });
          this.response.end(html);
        } catch (ex) {
          this.response.error(ex);
        }
      }
    }
  }, {
    key: 'view',
    get: function get() {
      throw 'NotImplemented. The \'view\' property is not implemented!';
    }
  }, {
    key: 'viewInstance',
    get: function get() {
      return this._viewInstance;
    }
  }, {
    key: 'isViewRendered',
    get: function get() {
      return this.viewInstance !== null;
    }
  }, {
    key: 'i18n',
    get: function get() {
      return this.request.i18n;
    }
  }, {
    key: 'serverSideRenderOnly',
    get: function get() {
      return false;
    }
  }], [{
    key: 'loginRequired',
    get: function get() {
      return true;
    }
  }]);

  return BaseController;
}();

var BaseLayoutController = exports.BaseLayoutController = function (_BaseController) {
  _inherits(BaseLayoutController, _BaseController);

  function BaseLayoutController() {
    _classCallCheck(this, BaseLayoutController);

    return _possibleConstructorReturn(this, (BaseLayoutController.__proto__ || Object.getPrototypeOf(BaseLayoutController)).apply(this, arguments));
  }

  _createClass(BaseLayoutController, [{
    key: 'getViewForRendering',
    value: function getViewForRendering() {
      return this.layoutView;
    }
  }, {
    key: 'reconcileWithServer',
    value: function reconcileWithServer() {
      if (_contexts.runtime.isClient && window.VIEW_PROPS) {
        //re-sync server rendered props (content is not a serializable prop ... so is not available in serialized VIEW_PROPS)
        window.VIEW_PROPS.content = this.view;
        _get(BaseLayoutController.prototype.__proto__ || Object.getPrototypeOf(BaseLayoutController.prototype), 'render', this).call(this, window.VIEW_PROPS);
        window.VIEW_PROPS = null;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var mergedContext = {};

      mergedContext.contentProps = context;
      mergedContext.content = this.view;
      _get(BaseLayoutController.prototype.__proto__ || Object.getPrototypeOf(BaseLayoutController.prototype), 'render', this).call(this, mergedContext);
    }
  }, {
    key: 'layoutView',

    // in base layout view
    // layout view correspond to BaseController view
    // and view correspond to the view to set in content property

    get: function get() {
      throw 'NotImplemented. The \'layoutView\' property is not implemented!';
    }
  }]);

  return BaseLayoutController;
}(BaseController);