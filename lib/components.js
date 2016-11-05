'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ReactLink = require('react/lib/ReactLink');

var _ReactLink2 = _interopRequireDefault(_ReactLink);

var _ReactStateSetters = require('react/lib/ReactStateSetters');

var _ReactStateSetters2 = _interopRequireDefault(_ReactStateSetters);

var _remarkable = require('remarkable');

var _remarkable2 = _interopRequireDefault(_remarkable);

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
    key: 'linkState',
    value: function linkState(key) {
      return new _ReactLink2.default(this.state[key], _ReactStateSetters2.default.createStateKeySetter(this, key));
    }
  }, {
    key: 'setStateFromObject',
    value: function setStateFromObject(obj) {
      var state = {};
      var proto = Reflect.getPrototypeOf(obj);
      var hasMethods = false;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Reflect.ownKeys(proto)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _name = _step.value;

          if (Reflect.getOwnPropertyDescriptor(proto, _name).get) {
            state[_name] = obj[_name];
            hasMethods = true;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (!hasMethods) {
        var protoBase = Reflect.getPrototypeOf(proto);

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = Reflect.ownKeys(protoBase)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var name = _step2.value;

            if (Reflect.getOwnPropertyDescriptor(protoBase, name).get) {
              state[name] = obj[name];
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      this.setState(state);
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