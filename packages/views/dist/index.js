'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseLayoutView = exports.BaseView = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _components = require('@outlinejs/components');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseView = exports.BaseView = function (_BaseComponent) {
  _inherits(BaseView, _BaseComponent);

  function BaseView() {
    _classCallCheck(this, BaseView);

    return _possibleConstructorReturn(this, (BaseView.__proto__ || Object.getPrototypeOf(BaseView)).apply(this, arguments));
  }

  _createClass(BaseView, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return this.props.__context || {
        request: this.props.__request,
        response: this.props.__response
      };
    }
  }], [{
    key: 'childContextTypes',
    get: function get() {
      return {
        request: _react2.default.PropTypes.object,
        response: _react2.default.PropTypes.object
      };
    }
  }]);

  return BaseView;
}(_components.BaseComponent);

var BaseLayoutView = exports.BaseLayoutView = function (_BaseView) {
  _inherits(BaseLayoutView, _BaseView);

  function BaseLayoutView() {
    _classCallCheck(this, BaseLayoutView);

    return _possibleConstructorReturn(this, (BaseLayoutView.__proto__ || Object.getPrototypeOf(BaseLayoutView)).apply(this, arguments));
  }

  _createClass(BaseLayoutView, [{
    key: 'renderContent',
    value: function renderContent() {
      var Content = this.props.content;
      return _react2.default.createElement(Content, _extends({}, this.props.contentProps, { delegate: this.delegate, __context: this.getChildContext() }));
    }
  }]);

  return BaseLayoutView;
}(BaseView);