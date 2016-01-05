import Backbone from 'backbone';
import { Token } from '../oauth';

let sync = Backbone.sync;

Backbone.sync = function (method, model, options = {}) {
  return new Promise(
    (resolve, reject) => {

      Token.validateToken().then((token) => {
        token = `Bearer ${token}`;

        if (token) {
          options.headers = options.headers || {};
          options.headers.Authorization = token;
        }

        sync(method, model, options).done(
          (data) => {
            resolve(data);
          }
        ).fail(
          (xhr) => {
            var errorObj = {
              code: xhr.status,
              error: xhr.statusText
            };
            // BAD REQUEST
            if (xhr.status === 400) {
              errorObj = {
                code: xhr.status,
                error: xhr.responseJSON
              };
            }
            reject(errorObj);
          }
        );

      }).catch((xhr) => {
        console.log(xhr);
        reject(xhr);
      });

    });
};
