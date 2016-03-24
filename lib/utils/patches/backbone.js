'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.backboneSync = backboneSync;

var _backbone = require('backbone');

var _backbone2 = _interopRequireDefault(_backbone);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _https = require('https');

var _https2 = _interopRequireDefault(_https);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var httpMethodMap = {
  create: 'POST',
  update: 'PUT',
  patch: 'PATCH',
  delete: 'DELETE',
  read: 'GET'
};

function backboneSync(method, model, options) {
  var p = new Promise(function (resolve, reject) {
    var reqUrl = options.url;
    var bodyData;
    var qs;
    var protocol = _http2.default;
    var params = {
      method: httpMethodMap[method],
      headers: {
        Accept: 'application/json'
      }
    };

    if (!reqUrl) {
      if (typeof model.url === 'function') {
        reqUrl = model.url();
      } else {
        reqUrl = model.url;
      }
      if (!reqUrl) {
        throw new Error('A "url" property or function must be specified');
      }
    }

    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.headers['Content-Type'] = 'application/json';
      bodyData = JSON.stringify(options.attrs || model.toJSON(options));
      params.headers['Content-Length'] = Buffer.byteLength(bodyData);
    }

    if (options.headers) {
      params.headers = Object.assign(options.headers, params.headers);
    }

    if (params.method === 'GET') {
      qs = _querystring2.default.stringify(options.data);
    }

    reqUrl = _url2.default.parse(reqUrl);
    params.protocol = reqUrl.protocol;
    if (params.protocol === 'https:') {
      protocol = _https2.default;
    }
    params.hostname = reqUrl.hostname;
    params.port = reqUrl.port;
    params.path = reqUrl.path;
    if (qs) {
      params.path = reqUrl.query ? params.path + '&' + qs : params.path + '?' + qs;
    }

    var req = protocol.request(params, function (res) {
      var responseText = '';
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        responseText += chunk;
      });
      res.on('end', function () {
        var jData;
        if (res.headers['content-type'].includes('application/json')) {
          jData = JSON.parse(responseText);
        }
        if (res.statusCode >= 200 && res.statusCode < 300 || res.statusCode === 304) {
          options.success(jData);
          resolve(model);
        } else {
          options.error(jData);
          reject({
            code: res.statusCode,
            errorText: res.statusMessage,
            errorJSON: jData
          });
        }
      });
    });

    req.on('error', function (e) {
      options.error(e);
      reject({
        code: 0,
        errorText: e.message,
        errorJSON: null
      });
    });

    model.trigger('request', model, p, options);

    if (bodyData) {
      req.write(bodyData);
    }
    req.end();
  });
  return p;
}

_backbone2.default.sync = backboneSync;