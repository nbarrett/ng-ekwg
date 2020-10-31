var {config} = require("../config/config");

exports.processSuccessfulResponse = function (req, res, response, messageType, debug) {
  debug("Data", JSON.stringify(response), "Received", messageType, "successful response");
  res.json({request: {messageType}, response});
};

exports.processUnsuccessfulResponse = function (req, res, error, messageType, debug) {
  debug("Received", messageType, "error response", JSON.stringify(error));
  res.json({request: {messageType}, error: error});
};

exports.logRequestData = function (messageType, requestData, debug) {
  debug("Sending", messageType, "request", JSON.stringify(requestData));
};

exports.debug = function (messageType, requestData, debug) {
  debug("Sending", messageType, "request", JSON.stringify(requestData));
};

exports.mapListTypeToId = function (req, debug) {
  var listId = config.mailchimp.lists[req.params.listType];
  debug('Mapping list type "' + req.params.listType + '" -> mailchimp Id', listId);
  return listId;
};

