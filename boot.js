import 'babel-polyfill';
import { _initContexts } from './contexts';
import './utils/patches/backbone';
import { RouteUtils } from './routers';

export default class {
  static init(routerClass, containerNode, settings) {
    _initContexts(settings, containerNode);
    var runtime = require('./contexts').runtime;
    if (runtime.isClient) {
      var fastclick = require('fastclick');
      fastclick(document.body);
    }
    RouteUtils.listen(routerClass);
  }
}
