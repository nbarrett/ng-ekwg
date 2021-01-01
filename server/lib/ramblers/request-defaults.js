const {envConfig} = require("../env-config/env-config");
const url = require("url");

exports.createApiRequestOptions = function () {
  const ramblersUrl = url.parse(envConfig.ramblers.url);
  return {
    hostname: ramblersUrl.host,
    protocol: ramblersUrl.protocol,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
};

}
