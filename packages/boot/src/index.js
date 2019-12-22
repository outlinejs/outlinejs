/**
 * Bootstrap utils module.
 * @module outlinejs/boot
 */
import {_init as contextInit} from '@outlinejs/contexts';
import {_init as confInit} from '@outlinejs/conf';

/**
 * Class for bootstrapping an outlineJs project.
 */
export default class Boot {
  /**
   * Bootstrap the outlineJs isomorphic application.
   * @param {BaseSettings} settingsClass - The project settings class
   * @param {BaseRouter} routerClass - The main router class defined in main urls.js module
   * @param {string} containerNodeId - The node id where to render the view layer
   * @param {string} serverHtmlTemplate - The html template for server-side rendering
   */
  static init(settingsClass, routerClass, containerNodeId, serverHtmlTemplate) {
    confInit(settingsClass);
    contextInit(containerNodeId, routerClass, serverHtmlTemplate);
  }
}
