import Backbone from 'backbone';
import fastclick from 'fastclick';
import 'babel-polyfill';
import { _initContexts } from './contexts';
import './utils/patches/backbone';

export default class {
  static init(routerClass, mainDOMElement, settings) {
    _initContexts(settings);

    fastclick(document.body);
    Backbone.history.start();

    var mainRouter = new routerClass('', { createTrailingSlashRoutes: false }, mainDOMElement); //eslint-disable-line no-unused-vars, new-cap
    Backbone.history.stop();
    Backbone.history.start();
  }
}
