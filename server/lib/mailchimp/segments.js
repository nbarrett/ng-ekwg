const {config} = require("../config/config");
const debug = require("debug")(config.logNamespace("mailchimp:routes:segments"));
const messageHandler = require("./messageHandler");
const mcapi = require("mailchimp-api");
const transforms = require("./../mongo/controllers/transforms");

const mc = new mcapi.Mailchimp(config.mailchimp.apiKey);

/*

 segment-update(string apikey, string id, int seg_id, struct opts)

 */

exports.segmentRename = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "seg_id": req.body.segmentId,
    "opts": {
      "name": req.body.segmentName,
    },
  };
  var messageType = "static segment rename";
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.segmentUpdate(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 lists/static-segment-add (string apikey, string id, string name)
 Save a segment against a list for later use. There is no limit to the number of segments which can be saved. Static Segments are not tied to any merge data, interest groups, etc. They essentially allow you to configure an unlimited number of custom segments which will have standard performance. When using proper segments, Static Segments are one of the available options for segmentation just as if you used a merge var (and they can be used with other segmentation options), though performance may degrade at that point.

 */

exports.segmentAdd = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "name": req.body.segmentName,
  };
  var messageType = "static segment add";
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.staticSegmentAdd(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 lists/static-segment-del (string apikey, string id, int seg_id)
 Delete a static segment. Note that this will, of course, remove any member affiliations with the segment

 */

exports.segmentDel = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "seg_id": req.params.segmentId,
  };

  var messageType = "static segment delete";
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.staticSegmentDel(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 lists/static-segment-members-add (string apikey, string id, int seg_id, array batch)
 Add list members to a static segment. It is suggested that you limit batch size to no more than 10,000 addresses per call. Email addresses must exist on the list in order to be included - this will not subscribe them to the list!

 */

exports.segmentMembersAdd = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "seg_id": req.body.segmentId,
    "batch": req.body.segmentMembers,
  };
  var messageType = "static segment members add";
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.staticSegmentMembersAdd(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 lists/static-segment-members-del (string apikey, string id, int seg_id, array batch)
 Remove list members from a static segment. It is suggested that you limit batch size to no more than 10,000 addresses per call. Email addresses must exist on the list in order to be removed - this will not unsubscribe them from the list!

 */

exports.segmentMembersDel = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "seg_id": transforms.parse(req, "segmentId"),
    "batch": transforms.parse(req, "segmentMembers"),
  };
  var messageType = "static segment delete";
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.staticSegmentMembersDel(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 lists/static-segment-reset (string apikey, string id, int seg_id)
 Resets a static segment - removes all members from the static segment. Note: does not actually affect list member data


 */

exports.segmentReset = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "seg_id": req.body.segmentId,
  };
  var messageType = "segment reset";
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.staticSegmentReset(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};

/*

 lists/static-segments (string apikey, string id, boolean get_counts, int start, int limit)
 Retrieve all of the Static Segments for a list.

 */

exports.segments = function (req, res) {
  var requestData = {
    "id": messageHandler.mapListTypeToId(req, debug),
    "get_counts": true,
    "limit": 1000,
  };
  var messageType = "list segments";
  messageHandler.logRequestData(messageType, requestData, debug);
  mc.lists.staticSegments(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debug);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debug);
  });
};
