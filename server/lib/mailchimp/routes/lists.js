'use strict';
let config = require('../../config/config.js');
let debug = require('debug')(config.logNamespace('mailchimp:routes:lists'));
let messageHandler = require('./messageHandler.js');
let mcapi = require('mailchimp-api');
let mc = new mcapi.Mailchimp(config.mailchimp.apiKey);

/*
 * GET list of lists.
 */

exports.list = function (req, res) {
  var requestData = {};
  var messageType = 'list lists';
  debug(messageType, requestData);
  mc.lists.list(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*
 * list members.
 */

exports.members = function (req, res) {
  var requestData = {
    id: messageHandler.mapListTypeToId(req, debug),
    status: "subscribed",
    opts: {
      start: 0,
      limit:100
    }};
  var messageType = 'list members';
  debug(messageType, requestData);
  mc.lists.members(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*
 * Subscribe an email to a list.
 */

exports.subscribe = function (req, res) {
  var requestData = {
    id: messageHandler.mapListTypeToId(req, debug),
    email: {email: req.body.email}
  };
  var messageType = 'subscribe member to mailing list';
  debug(messageType, requestData);
  mc.lists.subscribe(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*
 * batch subscribe a complete list.
 */

exports.batchSubscribe = function (req, res) {
  var requestData = {
    id: messageHandler.mapListTypeToId(req, debug),
    batch: req.body,
    double_optin: false,
    update_existing: true,
    replace_interests: true
  };
  var messageType = 'batch subscribe to list';
  debug(messageType, requestData);
  mc.lists.batchSubscribe(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};


/*
 * batch unsubscribe a complete list.
 */

exports.batchUnsubscribe = function (req, res) {
  var requestData = {
    id: messageHandler.mapListTypeToId(req, debug),
    batch: req.body,
    delete_member: true,
    send_goodbye: false,
    send_notify: false
  };
  var messageType = 'batch unsubscribe from list';
  debug(messageType, requestData);
  mc.lists.batchUnsubscribe(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};
