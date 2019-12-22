"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _contexts = require("@outlinejs/contexts");

var _conf = require("@outlinejs/conf");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Class for bootstrapping an outlineJs project.
 */
var Boot =
/*#__PURE__*/
function () {
  function Boot() {
    _classCallCheck(this, Boot);
  }

  _createClass(Boot, null, [{
    key: "init",

    /**
     * Bootstrap the outlineJs isomorphic application.
     * @param {BaseSettings} settingsClass - The project settings class
     * @param {BaseRouter} routerClass - The main router class defined in main urls.js module
     * @param {string} containerNodeId - The node id where to render the view layer
     * @param {string} serverHtmlTemplate - The html template for server-side rendering
     */
    value: function init(settingsClass, routerClass, containerNodeId, serverHtmlTemplate) {
      (0, _conf._init)(settingsClass);
      (0, _contexts._init)(containerNodeId, routerClass, serverHtmlTemplate);
    }
  }]);

  return Boot;
}();

exports["default"] = Boot;