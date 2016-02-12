import 'babel-polyfill';
import { _initContexts } from './contexts';
import './utils/patches/backbone';
import { RouteUtils } from './routers';
import { runtime } from './contexts';

export default class {
  static init(routerClass, containerNodeId, settings) {
    _initContexts(settings, containerNodeId);
    if (runtime.isClient) {
      var fastclick = require('fastclick');
      fastclick(document.body);
    }
    RouteUtils.listen(routerClass);
  }
}
