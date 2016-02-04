import Backbone from 'backbone';
import { Token } from '../oauth';

let sync = Backbone.sync;

Backbone.sync = function (method, model, options = {}) {
  return new Promise(
    (resolve, reject) => {

      Token.validateToken().then((token) => {
        if (token) {
          token = `Bearer ${token}`;
          options.headers = options.headers || {};
          options.headers.Authorization = token;
        }

        sync(method, model, options).then(
          () => {
            resolve(model);
          }, (err) => {
          reject(err);
        });

      }, ($xhr) => {
        reject({
          code: $xhr.status,
          errorText: $xhr.statusText,
          errorJSON: $xhr.responseJSON
        });
      });

    });
};
