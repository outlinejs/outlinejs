"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Link = exports.Head = exports.BaseComponent = void 0;

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _remarkable = _interopRequireDefault(require("remarkable"));

var _reactHelmet = _interopRequireDefault(require("react-helmet"));

var _routing = require("@outlinejs/routing");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var BaseComponent =
/*#__PURE__*/
function (_React$Component) {
  _inherits(BaseComponent, _React$Component);

  function BaseComponent() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, BaseComponent);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(BaseComponent)).call.apply(_getPrototypeOf2, [this].concat(args)));
    _this._delegate = null;
    return _this;
  }

  _createClass(BaseComponent, [{
    key: "rawMarkup",
    value: function rawMarkup(text) {
      var md = new _remarkable["default"]({
        html: true,
        breaks: true
      });
      return md.render(text);
    }
  }, {
    key: "static",
    value: function _static(asset) {
      return "/static/".concat(asset);
    }
  }, {
    key: "request",
    get: function get() {
      return this.props.__request || this.context.request;
    }
  }, {
    key: "response",
    get: function get() {
      return this.props.__response || this.context.response;
    }
  }, {
    key: "i18n",
    get: function get() {
      return this.request.i18n;
    }
  }, {
    key: "delegate",
    set: function set(value) {
      this._delegate = value;
      this.props.delegate = value;
    },
    get: function get() {
      if (this._delegate !== this.props.delegate) {
        this._delegate = this.props.delegate;
      }

      if (!this._delegate) {
        this._delegate = this;
      }

      return this._delegate;
    }
  }], [{
    key: "contextTypes",
    get: function get() {
      return {
        request: _propTypes["default"].object,
        response: _propTypes["default"].object
      };
    }
  }]);

  return BaseComponent;
}(_react["default"].Component);

exports.BaseComponent = BaseComponent;

var Head =
/*#__PURE__*/
function (_BaseComponent) {
  _inherits(Head, _BaseComponent);

  function Head() {
    _classCallCheck(this, Head);

    return _possibleConstructorReturn(this, _getPrototypeOf(Head).apply(this, arguments));
  }

  _createClass(Head, [{
    key: "render",
    value: function render() {
      return _react["default"].createElement(_reactHelmet["default"], this.props);
    }
  }]);

  return Head;
}(BaseComponent);

exports.Head = Head;

var Link =
/*#__PURE__*/
function (_BaseComponent2) {
  _inherits(Link, _BaseComponent2);

  function Link() {
    _classCallCheck(this, Link);

    return _possibleConstructorReturn(this, _getPrototypeOf(Link).apply(this, arguments));
  }

  _createClass(Link, [{
    key: "handleClick",
    value: function handleClick(event) {
      var allowTransition = true;

      if (this.props.onClick) {
        this.props.onClick(event);
      }

      if (Link.isModifiedEvent(event) || !Link.isLeftClickEvent(event)) {
        return;
      }

      if (event.defaultPrevented === true) {
        allowTransition = false;
      } // If target prop is set (e.g. to "_blank") let browser handle link.


      if (this.props.target) {
        if (!allowTransition) {
          event.preventDefault();
        }

        return;
      }

      event.preventDefault();

      if (allowTransition) {
        var _this$props = this.props,
            state = _this$props.state,
            params = _this$props.params;
        this.response.navigate(state, params);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var props = {};
      var _this$props2 = this.props,
          state = _this$props2.state,
          params = _this$props2.params,
          className = _this$props2.className,
          activeClassName = _this$props2.activeClassName,
          children = _this$props2.children,
          style = _this$props2.style,
          title = _this$props2.title;
      props.href = _routing.Utils.reverse(state, this.request, params);

      if (className) {
        props.className = className;
      }

      if (activeClassName) {
        if (this.request && this.request.absoluteUrl.endsWith(props.href)) {
          if (className) {
            props.className += " ".concat(activeClassName);
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
      return _react["default"].createElement("a", _extends({}, props, {
        onClick: this.handleClick.bind(this)
      }));
    }
  }], [{
    key: "isLeftClickEvent",
    value: function isLeftClickEvent(event) {
      return event.button === 0;
    }
  }, {
    key: "isModifiedEvent",
    value: function isModifiedEvent(event) {
      return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
    }
  }]);

  return Link;
}(BaseComponent);

exports.Link = Link;