"use strict";
const config = require("../config/config");
const url = require("url");
const querystring = require("querystring");

exports.createApiRequestOptions = function (body) {
  const successStatusCodes = [409, 410, 200, 201, 202, 204, 304];
  const meetupApiUrl = url.parse(config.meetup.apiUrl);
  let headers;
  if (body) {
    const formData = querystring.stringify(body);
    headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": formData.length,
      "Authorization": "Bearer " + config.meetup.oauth.accessToken,
    };
  } else {
    headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Bearer " + config.meetup.oauth.accessToken,
    };
  }

  return {
    successStatusCodes,
    hostname: meetupApiUrl.host,
    protocol: meetupApiUrl.protocol,
    headers: headers
  };

}
