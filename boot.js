import 'babel-polyfill';
import { _initContexts } from './contexts';
import './utils/patches/backbone';
import { RouteUtils } from './routers';

export default class {
  static init(routerClass, containerNodeId, settings) {
    _initContexts(settings, containerNodeId);
    RouteUtils.listen(routerClass);
  }
}
