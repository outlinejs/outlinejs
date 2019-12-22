"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseLayoutController = exports.BaseController = void 0;

var _reactDom = _interopRequireDefault(require("react-dom"));

var _server = _interopRequireDefault(require("react-dom/server"));

var _react = _interopRequireDefault(require("react"));

var _reactHelmet = _interopRequireDefault(require("react-helmet"));

var _contexts = require("@outlinejs/contexts");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var safeStringifyRegExScript = new RegExp('<\/script', 'g');
var safeStringifyRegExComment = new RegExp('<!--', 'g');

function safeStringify(obj) {
  return JSON.stringify(obj).replace(safeStringifyRegExScript, '<\\/script').replace(safeStringifyRegExComment, '<\\!--');
}

var BaseController =
/*#__PURE__*/
function () {
  function BaseController(request, response) {
    _classCallCheck(this, BaseController);

    this._viewInstance = null;
    this.request = request;
    this.response = response;
  }

  _createClass(BaseController, [{
    key: "getViewForRendering",
    value: function getViewForRendering() {
      return this.view;
    }
  }, {
    key: "reconcileWithServer",
    value: function reconcileWithServer() {
      if (_contexts.runtime.isClient && window.VIEW_PROPS) {
        this.render(window.VIEW_PROPS);
        window.VIEW_PROPS = null;
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var View = this.getViewForRendering(); // eslint-disable-line
      // it's the root view, remove the child context request

      if (_contexts.runtime.isClient) {
        if (!this.serverSideRenderOnly && _contexts.runtime.currentClientResponse === this.response) {
          this._viewInstance = _reactDom["default"].render(_react["default"].createElement(View, _extends({}, context, {
            delegate: this,
            __request: this.request,
            __response: this.response
          })), _contexts.runtime.renderContainerObject);
        }
      } else {
        try {
          // render react component
          var html = _contexts.runtime.renderContainerObject.replace(_contexts.runtime.serverRenderContainerPattern, function (match, pre, inside, post) {
            return pre + _server["default"].renderToString(_react["default"].createElement(View, _extends({}, context, {
              delegate: _this,
              __request: _this.request,
              __response: _this.response
            }))) + post;
          }); // render react component props


          var propScript = _server["default"].renderToStaticMarkup(_react["default"].DOM.script({
            dangerouslySetInnerHTML: {
              __html: "var VIEW_PROPS = ".concat(safeStringify(context), ";")
            }
          }));

          html = html.replace('<head>', "<head>".concat(propScript));

          var head = _reactHelmet["default"].rewind();

          html = html.replace('<html>', "<html ".concat(head.htmlAttributes.toString(), ">"));
          html = html.replace('<head>', "<head>".concat(head.title.toString()));
          html = html.replace('<head>', "<head>".concat(head.meta.toString()));
          html = html.replace('<head>', "<head>".concat(head.link.toString()));
          html = html.replace('<head>', "<head>".concat(head.noscript.toString())); // output to http response

          this.response.writeHead(200, {
            'Content-Type': 'text/html'
          });
          this.response.end(html);
        } catch (ex) {
          this.response.error(ex);
        }
      }
    }
  }, {
    key: "view",
    get: function get() {
      throw 'NotImplemented. The \'view\' property is not implemented!';
    }
  }, {
    key: "viewInstance",
    get: function get() {
      return this._viewInstance;
    }
  }, {
    key: "isViewRendered",
    get: function get() {
      return this.viewInstance !== null;
    }
  }, {
    key: "i18n",
    get: function get() {
      return this.request.i18n;
    }
  }, {
    key: "serverSideRenderOnly",
    get: function get() {
      return false;
    }
  }], [{
    key: "loginRequired",
    get: function get() {
      return true;
    }
  }]);

  return BaseController;
}();

exports.BaseController = BaseController;

var BaseLayoutController =
/*#__PURE__*/
function (_BaseController) {
  _inherits(BaseLayoutController, _BaseController);

  function BaseLayoutController() {
    _classCallCheck(this, BaseLayoutController);

    return _possibleConstructorReturn(this, _getPrototypeOf(BaseLayoutController).apply(this, arguments));
  }

  _createClass(BaseLayoutController, [{
    key: "getViewForRendering",
    value: function getViewForRendering() {
      return this.layoutView;
    }
  }, {
    key: "reconcileWithServer",
    value: function reconcileWithServer() {
      if (_contexts.runtime.isClient && window.VIEW_PROPS) {
        //re-sync server rendered props (content is not a serializable prop ... so is not available in serialized VIEW_PROPS)
        window.VIEW_PROPS.content = this.view;

        _get(_getPrototypeOf(BaseLayoutController.prototype), "render", this).call(this, window.VIEW_PROPS);

        window.VIEW_PROPS = null;
      }
    }
  }, {
    key: "render",
    value: function render() {
      var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var mergedContext = {};
      mergedContext.contentProps = context;
      mergedContext.content = this.view;

      _get(_getPrototypeOf(BaseLayoutController.prototype), "render", this).call(this, mergedContext);
    }
  }, {
    key: "layoutView",
    // in base layout view
    // layout view correspond to BaseController view
    // and view correspond to the view to set in content property
    get: function get() {
      throw 'NotImplemented. The \'layoutView\' property is not implemented!';
    }
  }]);

  return BaseLayoutController;
}(BaseController);

exports.BaseLayoutController = BaseLayoutController;