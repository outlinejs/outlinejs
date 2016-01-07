import $ from 'jquery';
import Backbone from 'backbone';
import fastclick from 'fastclick';
import 'babel-polyfill';
import { _initContexts } from './contexts';

export default class {
  static init(routerClass, mainDOMElement, settings) {
    _initContexts(settings);

    /* start patch */
    Backbone.$ = $;
    /* end patch */

    fastclick(document.body);
    Backbone.history.start();

    var mainRouter = new routerClass('', { createTrailingSlashRoutes: false }, mainDOMElement); //eslint-disable-line no-unused-vars, new-cap
    Backbone.history.stop();
    Backbone.history.start();
  }
}
