import $ from 'jquery';
import Backbone from 'backbone';
import fastclick from 'fastclick';
import 'babel-polyfill';

export default class Boot {
  init(routerClass, mainDOMElement) {
    /* start patch */
    Backbone.$ = $;
    /* end patch */

    fastclick(document.body);
    Backbone.history.start();

    var mainRouter = new (routerClass('', { createTrailingSlashRoutes: false }, mainDOMElement)); //eslint-disable-line no-unused-vars
    Backbone.history.stop();
    Backbone.history.start();
  }
}
