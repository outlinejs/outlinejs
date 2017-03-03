'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Link = exports.Head = exports.BaseComponent = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _remarkable = require('remarkable');

var _remarkable2 = _interopRequireDefault(_remarkable);

var _reactHelmet = require('react-helmet');

var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

var _routeUtils = require('@outlinejs/route-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseComponent = exports.BaseComponent = function (_React$Component) {
  _inherits(BaseComponent, _React$Component);

  function BaseComponent() {
    var _ref;

    _classCallCheck(this, BaseComponent);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = BaseComponent.__proto__ || Object.getPrototypeOf(BaseComponent)).call.apply(_ref, [this].concat(args)));

    _this._delegate = null;
    return _this;
  }

  _createClass(BaseComponent, [{
    key: 'rawMarkup',
    value: function rawMarkup(text) {
      var md = new _remarkable2.default({ html: true, breaks: true });
      return md.render(text);
    }
  }, {
    key: 'request',
    get: function get() {
      return this.props.__request || this.context.request;
    }
  }, {
    key: 'response',
    get: function get() {
      return this.props.__response || this.context.response;
    }
  }, {
    key: 'i18n',
    get: function get() {
      return this.request.i18n;
    }
  }, {
    key: 'delegate',
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
    key: 'contextTypes',
    get: function get() {
      return {
        request: _react2.default.PropTypes.object,
        response: _react2.default.PropTypes.object
      };
    }
  }]);

  return BaseComponent;
}(_react2.default.Component);

var Head = exports.Head = function (_BaseComponent) {
  _inherits(Head, _BaseComponent);

  function Head() {
    _classCallCheck(this, Head);

    return _possibleConstructorReturn(this, (Head.__proto__ || Object.getPrototypeOf(Head)).apply(this, arguments));
  }

  _createClass(Head, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(_reactHelmet2.default, this.props);
    }
  }]);

  return Head;
}(BaseComponent);

var Link = exports.Link = function (_BaseComponent2) {
  _inherits(Link, _BaseComponent2);

  function Link() {
    _classCallCheck(this, Link);

    return _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
  }

  _createClass(Link, [{
    key: 'handleClick',
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
      }

      // If target prop is set (e.g. to "_blank") let browser handle link.
      if (this.props.target) {
        if (!allowTransition) {
          event.preventDefault();
        }
        return;
      }

      event.preventDefault();

      if (allowTransition) {
        var _props = this.props,
            state = _props.state,
            params = _props.params;


        this.response.navigate(state, params);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var props = {};
      var _props2 = this.props,
          state = _props2.state,
          params = _props2.params,
          className = _props2.className,
          activeClassName = _props2.activeClassName,
          children = _props2.children,
          style = _props2.style,
          title = _props2.title;


      props.href = _routeUtils.RouteUtils.reverse(state, this.request, params);

      if (className) {
        props.className = className;
      }

      if (activeClassName) {
        if (this.request && this.request.absoluteUrl.endsWith(props.href)) {
          if (className) {
            props.className += ' ' + activeClassName;
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

      return _react2.default.createElement('a', _extends({}, props, { onClick: this.handleClick.bind(this) }));
    }
  }], [{
    key: 'isLeftClickEvent',
    value: function isLeftClickEvent(event) {
      return event.button === 0;
    }
  }, {
    key: 'isModifiedEvent',
    value: function isModifiedEvent(event) {
      return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
    }
  }]);

  return Link;
}(BaseComponent);