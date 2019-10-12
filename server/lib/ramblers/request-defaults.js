"use strict";
const config = require("../config/config");
const url = require("url");

exports.createApiRequestOptions = function () {
  const ramblersUrl = url.parse(config.ramblers.url);
  return {
  hostname: ramblersUrl.host,
  protocol: ramblersUrl.protocol,
  headers: {
    "Content-Type": "application/json; charset=utf-8"
  }
};

}
