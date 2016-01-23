import { Token } from './oauth';
import { RouteUtils } from '../routers';
import { settings } from '../contexts';

export default class {
  preControllerInit() {
    return new Promise((resolve, reject) => {
      var token = Token.getAccessToken();
      if (!token) {
        reject();
        var loginUrl = RouteUtils.reverse(settings.LOGIN_STATE);
        var nextUrl = encodeURIComponent(window.location.href);
        loginUrl = `${loginUrl}?next-url=${nextUrl}`;
        window.location.href = loginUrl;
        return;
      }

      resolve();
    });
  }
}
