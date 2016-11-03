'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseCollection = undefined;

var _backbone = require('backbone');

var _backbone2 = _interopRequireDefault(_backbone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BaseCollection = exports.BaseCollection = function (_Backbone$Collection) {
  _inherits(BaseCollection, _Backbone$Collection);

  function BaseCollection() {
    _classCallCheck(this, BaseCollection);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(BaseCollection).apply(this, arguments));
  }

  return BaseCollection;
}(_backbone2.default.Collection);