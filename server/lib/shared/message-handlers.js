const {config} = require("../config/config");
const https = require("https");
const isEmpty = require("lodash/isEmpty");
const querystring = require("querystring");

exports.httpRequest = (options) => new Promise((resolve, reject) => {
  const requestAudit = createRequestAudit(options);
  options.debug("sending request using API request options", options.apiRequest)
  const request = https.request(options.apiRequest, response => {
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
      if ((options.successStatusCodes || [200]).includes(response.statusCode)) {
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
        const rawData = Buffer.concat(data).toString();
        try {
          options.debug("parsing raw data", rawData)
          let parsedDataJSON = isEmpty(rawData) ? {} : JSON.parse(rawData);
          returnValue.response = parsedDataJSON.errors ? parsedDataJSON : (options.mapper ? options.mapper(parsedDataJSON) : parsedDataJSON);
        } catch (err) {
          options.res.statusCode = 500;
          const message = rawData;
          options.debug(message, rawData, err)
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
  if (!isEmpty(options.body)) {
    options.debug("sending body", options.body)
    const formData = querystring.stringify(options.body);
    options.debug("writing formData", formData)
    request.write(formData);
  }
  request.end();
})

function createRequestAudit(options) {
  const requestAudit = {
    request: {
      parameters: options.req.params,
      url: options.req.url,
    }
  };
  if (!isEmpty(options.body)) {
    requestAudit.request.body = options.body;
  }
  if (config.dev) {
    requestAudit.request.apiRequest = options.apiRequest;
  }
  return requestAudit;
}
