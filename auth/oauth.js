import Base64 from 'base-64';
import $ from 'jquery';
import { settings } from '../contexts';

export class Token {

  static getAccessToken() {
    //var token = localStorage.getItem('bearerToken');
    var token = null;
    var jsonToken = localStorage.getItem('token');
    if (jsonToken) {
      token = JSON.parse(jsonToken).access_token;
    }
    return token;
  }

  static setAuthToken(jsonToken) {
    if (jsonToken !== undefined) {
      localStorage.setItem('token', jsonToken);
      var now = new Date();
      localStorage.setItem('creationDate', now);
    }
  }

  static removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('creationDate');
  }


  static passwordCredentialGrant(username, password) {
    var authHeader = 'Basic ' + Base64.encode(settings.OAUTH2_CLIENT_ID + ':' + settings.OAUTH2_CLIENT_SECRET);
    return new Promise((resolve, reject) => {
      $.ajax({
        method: 'POST',
        url: settings.OAUTH2_BASE_ENDPOINT + 'token/',
        data: $.param({
          grant_type: 'password', //eslint-disable-line camelcase
          username: username,
          password: password
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: authHeader
        }
      }).success((data) => {
        Token.setAuthToken(JSON.stringify(data));
        resolve(data.access_token);

      }).error((xhr) => {
        console.log(xhr);
        reject(xhr);
      });
    });
  }

  static refreshTokenCredentialGrant(refreshToken) {
    var authHeader = 'Basic ' + Base64.encode(settings.OAUTH2_CLIENT_ID + ':' + settings.OAUTH2_CLIENT_SECRET);
    return new Promise((resolve, reject) => {
      $.ajax({
        method: 'POST',
        url: settings.OAUTH2_BASE_ENDPOINT + 'token/',
        data: $.param({
          grant_type: 'refresh_token', //eslint-disable-line camelcase
          refresh_token: refreshToken //eslint-disable-line camelcase
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: authHeader
        }
      }).success((data) => {
        Token.setAuthToken(JSON.stringify(data));
        resolve(data.access_token);

      }).error((xhr) => {
        console.log(xhr);
        reject(xhr);
      });
    });
  }

  static validateToken() {
    return new Promise((resolve, reject) => {
      var creationDate = new Date(localStorage.getItem('creationDate'));
      var now = new Date();
      var jsonToken = localStorage.getItem('token');
      if (jsonToken) {
        var expiresIn = parseInt(JSON.parse(jsonToken).expires_in) * 1000; //  localStorage.getItem('expiresIn')) * 1000;
        var refreshToken = JSON.parse(jsonToken).refresh_token; //  localStorage.getItem('refreshToken');
        var cachedToken = JSON.parse(jsonToken).access_token;
        if (now - creationDate > expiresIn - 10000) {
          Token.refreshTokenCredentialGrant(refreshToken).then((token) => {
            resolve(token);
          }, (xhr) => {
            reject(xhr);
          });
        } else {
          resolve(cachedToken);
        }
      } else {
        reject();
      }
    });
  }
}
