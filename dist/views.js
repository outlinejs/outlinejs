'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseView = undefined;

var _components = require('./components');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseView = exports.BaseView = function (_BaseComponent) {
  _inherits(BaseView, _BaseComponent);

  function BaseView() {
    _classCallCheck(this, BaseView);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(BaseView).apply(this, arguments));
  }

  return BaseView;
}(_components.BaseComponent);