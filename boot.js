import 'babel-polyfill';
import { _initContexts } from './contexts';
import './utils/patches/backbone';
import { RouteUtils } from './routers';

export default class {
  static init(settingsClass, routerClass, containerNodeId) {
    _initContexts(settingsClass, containerNodeId);
    RouteUtils.listen(routerClass);
  }
}
