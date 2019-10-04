"use strict";
const config = require("../config/config");
const debug = require("debug")(config.logNamespace("meetup"));
const url = require("url");
const successStatusCodes = [409, 410, 200, 201, 202, 204, 304];
const https = require("https");
const _ = require("underscore");
const querystring = require("querystring");

exports.httpRequest = (options) => new Promise((resolve, reject) => {
  const apiRequestOptions = createApiRequestOptions(options);
  debug("sending request using API request options", apiRequestOptions)
  const requestAudit = createRequestAudit(options, apiRequestOptions);
  const request = https.request(apiRequestOptions, response => {
    var data = [];
    options.res.httpVersion = response.httpVersion;
    options.res.trailers = response.trailers;
    options.res.headers = response.headers;
    response.on("data", chunk => {
      data.push(chunk);
    });
    response.on("end", () => {
      const returnValue = {apiStatusCode: response.statusCode};
      let debugPrefix;
      if (successStatusCodes.includes(response.statusCode)) {
        if (response.statusCode !== 200) {
          debugPrefix = "REMAPPED " + response.statusCode + " -> " + 200;
        } else {
          debugPrefix = "SUCCESS " + 200;
        }
        options.res.statusCode = 200;
      } else {
        debugPrefix = "ERROR " + response.statusCode;
        options.res.statusCode = response.statusCode;
      }
      if (response.statusCode === 204) {
        returnValue.response = {message: "request was successful but no data was returned"};
      } else {
        try {
          const rawData = Buffer.concat(data).toString();
          debug("parsing raw data", rawData)
          let parsedDataJSON = _.isEmpty(rawData) ? {} : JSON.parse(rawData);
          returnValue.response = parsedDataJSON.errors ? parsedDataJSON : (options.mapper ? options.mapper(parsedDataJSON) : parsedDataJSON);
        } catch (err) {
          options.res.statusCode = 500;
          const message = "ERROR:parsing JSON data";
          debug(message, data, err)
          const rejectedResponse = Object.assign(requestAudit, {message: message, response: {error: err.message}});
          options.debug("ERROR:", rejectedResponse);
          reject(rejectedResponse);
        }
      }
      const resolvedResponse = Object.assign(requestAudit, returnValue);
      options.debug(debugPrefix, ":", JSON.stringify(resolvedResponse));
      resolve(resolvedResponse);
    });
  });
  request.on("error", error => {
    const rejectedResponse = Object.assign(requestAudit, {
      message: "request.on error event occurred",
      response: {error: error}
    });
    options.debug("ERROR:", JSON.stringify(rejectedResponse));
    reject(rejectedResponse);
  });
  if (!_.isEmpty(options.body)) {
    debug("sending body", options.body)
    const formData = querystring.stringify(options.body);
    debug("writing formData", formData)
    request.write(formData);
  }
  request.end();
})

function createApiRequestOptions(options) {
  const meetupApiUrl = url.parse(config.meetup.apiUrl);
  let headers;
  if (options.body) {
    options.debug("body", options.body);
    const formData = querystring.stringify(options.body);
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

  return Object.assign({
    hostname: meetupApiUrl.host,
    protocol: meetupApiUrl.protocol,
    headers: headers,
  }, options.requestOptions);
}

function createRequestAudit(options, defaultOptions) {
  const requestAudit = {
    request: {
      parameters: options.req.params,
      url: options.req.url,
    }
  };
  if (options.body) {
    requestAudit.request.body = options.body;
  }
  if (config.dev) {
    requestAudit.request.apiRequest = defaultOptions;
  }
  return requestAudit;
}
