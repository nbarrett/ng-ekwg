'use strict';
let config = require('../../config/config.js');
let debug = require('debug')(config.logNamespace('mailchimp:routes:groups'));
let messageHandler = require('./messageHandler.js');
let mcapi = require('mailchimp-api');
let mc = new mcapi.Mailchimp(config.mailchimp.apiKey);

/*

 lists/interest-group-add (string apikey, string id, string group_name, int grouping_id)
 Add a single Interest Group - if interest groups for the List are not yet enabled, adding the first group will automatically turn them on.

 */

exports.interestGroupAdd = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "group_name": req.body.interestGroupName,
    "grouping_id": req.body.interestGroupingId
  };
  var messageType = 'interest group add';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.interestGroupAdd(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 lists/interest-group-del (string apikey, string id, string group_name, int grouping_id)
 Delete a single Interest Group - if the last group for a list is deleted, this will also turn groups for the list off.

 */

exports.interestGroupDel = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "group_name": req.body.interestGroupName,
    "grouping_id": req.body.interestGroupingId
  };
  var messageType = 'interest group delete';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.interestGroupDel(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};


/*

 lists/interest-group-update (string apikey, string id, string old_name, string new_name, int grouping_id)
 Change the name of an Interest Group

 */

exports.interestGroupUpdate = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "old_name": req.body.oldName,
    "new_name": req.body.newName,
    "grouping_id": req.body.interestGroupingId
  };
  var messageType = 'interest group update';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.interestGroupUpdate(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};


/*

 lists/interest-grouping-add (string apikey, string id, string name, string type, array groups)
 Add a new Interest Grouping - if interest groups for the List are not yet enabled, adding the first grouping will automatically turn them on.

 */

exports.interestGroupingAdd = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "name": req.body.interestGroupingName,
    "type": "hidden",
    "groups": req.body.groups
  };
  var messageType = 'interest grouping add';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.interestGroupingAdd(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};


/*

 lists/interest-grouping-del (string apikey, int grouping_id)
 Delete an existing Interest Grouping - this will permanently delete all contained interest groups and will remove those selections from all list members

 */

exports.interestGroupingDel = function (req, res) {
  var requestData = {
    "grouping_id": req.body.interestGroupingId
  };
  var messageType = 'interest grouping delete';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.interestGroupingDel(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};


/*

 Get the list of interest groupings for a given list, including the label, form information, and included groups for each
 lists/interest-groupings (string apikey, string id, bool counts)

 */

exports.interestGroupings = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "counts": true
  };
  var messageType = 'interestGroupings list';
  messageHandler.logRequestData(messageType, requestData, debug);

  mc.lists.interestGroupings(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 lists/interest-grouping-update (string apikey, int grouping_id, string name, string value)
 Update an existing Interest Grouping

 */

exports.interestGroupingUpdate = function (req, res) {
  var requestData = {
    "grouping_id": req.body.interestGroupingId,
    "name": req.body.interestGroupingName,
    "value": req.body.interestGroupingValue
  };
  var messageType = 'interestGroupings update';
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.interestGroupingUpdate(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};
