/**
 * Bootstrap utils module.
 * @module outlinejs/boot
 */
import 'babel-polyfill';
import { _initContexts } from './contexts';
import './utils/patches/backbone';
import { RouteUtils } from './routers';

/**
 * Class for bootstrapping an outlineJs project.
 */
export default class {
  /**
   * Bootstrap the outlineJs isomorphic application.
   * @param {BaseSettings} settingsClass - The project settings class
   * @param {BaseRouter} routerClass - The main router class defined in main urls.js module
   * @param {string} containerNodeId - The node id where to render the view layer
   */
  static init(settingsClass, routerClass, containerNodeId) {
    _initContexts(settingsClass, containerNodeId);
    RouteUtils.listen(routerClass);
  }
}
