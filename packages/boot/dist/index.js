'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Bootstrap utils module.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module outlinejs/boot
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _contexts = require('@outlinejs/contexts');

var _conf = require('@outlinejs/conf');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Class for bootstrapping an outlineJs project.
 */
var Boot = function () {
  function Boot() {
    _classCallCheck(this, Boot);
  }

  _createClass(Boot, null, [{
    key: 'init',

    /**
     * Bootstrap the outlineJs isomorphic application.
     * @param {BaseSettings} settingsClass - The project settings class
     * @param {BaseRouter} routerClass - The main router class defined in main urls.js module
     * @param {string} containerNodeId - The node id where to render the view layer
     */
    value: function init(settingsClass, routerClass, containerNodeId) {
      (0, _conf._init)(settingsClass);
      (0, _contexts._init)(containerNodeId, routerClass);
    }
  }]);

  return Boot;
}();

exports.default = Boot;