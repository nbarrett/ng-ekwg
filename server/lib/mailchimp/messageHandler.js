var config = require('../config/config');

exports.processSuccessfulResponse = function (req, res, responseData, messageType, debug) {
  res.json(responseData);
  debug('Data', JSON.stringify(responseData), 'Received', messageType, 'successful response');
};

exports.processUnsuccessfulResponse = function (req, res, error, messageType, debug) {
  debug('Received', messageType, 'error response', JSON.stringify(error));
  res.json(error);
};

exports.logRequestData = function (messageType, requestData, debug) {
  debug('Sending', messageType, 'request', JSON.stringify(requestData));
};

exports.debug = function (messageType, requestData, debug) {
  debug('Sending', messageType, 'request', JSON.stringify(requestData))
};

exports.mapListTypeToId = function (req, debug) {
  var listId = config.mailchimp.lists[req.params.listType];
  debug('Mapping list type "' + req.params.listType + '" -> mailchimp Id', listId);
  return listId;
};

