"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseLayoutView = exports.BaseView = void 0;

var _components = require("@outlinejs/components");

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

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

var BaseView =
/*#__PURE__*/
function (_BaseComponent) {
  _inherits(BaseView, _BaseComponent);

  function BaseView() {
    _classCallCheck(this, BaseView);

    return _possibleConstructorReturn(this, _getPrototypeOf(BaseView).apply(this, arguments));
  }

  _createClass(BaseView, [{
    key: "getChildContext",
    value: function getChildContext() {
      return this.props.__context || {
        request: this.props.__request,
        response: this.props.__response
      };
    }
  }], [{
    key: "childContextTypes",
    get: function get() {
      return {
        request: _propTypes["default"].object,
        response: _propTypes["default"].object
      };
    }
  }]);

  return BaseView;
}(_components.BaseComponent);

exports.BaseView = BaseView;

var BaseLayoutView =
/*#__PURE__*/
function (_BaseView) {
  _inherits(BaseLayoutView, _BaseView);

  function BaseLayoutView() {
    _classCallCheck(this, BaseLayoutView);

    return _possibleConstructorReturn(this, _getPrototypeOf(BaseLayoutView).apply(this, arguments));
  }

  _createClass(BaseLayoutView, [{
    key: "renderContent",
    value: function renderContent() {
      var Content = this.props.content;
      return _react["default"].createElement(Content, _extends({}, this.props.contentProps, {
        delegate: this.delegate,
        __context: this.getChildContext()
      }));
    }
  }]);

  return BaseLayoutView;
}(BaseView);

exports.BaseLayoutView = BaseLayoutView;