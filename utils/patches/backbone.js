import Backbone from 'backbone';
import $ from 'jquery';

Backbone.$ = $;
let sync = Backbone.sync;

Backbone.sync = function (method, model, options) {
  return new Promise(
    (resolve, reject) => {
      sync(method, model, options).done(
        (data) => {
          resolve(data);
        }
      ).fail(
        ($xhr) => {
          reject({
            code: $xhr.status,
            errorText: $xhr.statusText,
            errorJSON: $xhr.responseJSON
          });
        }
      );
    }
  );
};
