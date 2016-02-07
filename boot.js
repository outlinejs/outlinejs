import fastclick from 'fastclick';
import 'babel-polyfill';
import { _initContexts } from './contexts';
import './utils/patches/backbone';
import { RouteUtils } from './routers';

export default class {
  static init(routerClass, containerNode, settings) {
    _initContexts(settings, containerNode);
    fastclick(document.body);
    RouteUtils.listen(routerClass);
  }
}
