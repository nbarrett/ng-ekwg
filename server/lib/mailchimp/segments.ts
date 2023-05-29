import { envConfig } from "../env-config/env-config";
import mcapi = require("mailchimp-api");
import debug from "debug";
import * as messageHandler from "./message-handler";

const debugLog = debug(envConfig.logNamespace("mailchimp:routes:segments"));
const mc = new mcapi.Mailchimp(envConfig.mailchimp.apiKey);
import transforms = require("./../mongo/controllers/transforms");

export function segmentRename(req, res) {
  const requestData = {
    "id": messageHandler.mapListTypeToId(req, debugLog),
    "seg_id": req.body.segmentId,
    "opts": {
      "name": req.body.segmentName,
    },
  };
  const messageType = "static segment rename";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.lists.segmentUpdate(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

export function segmentAdd(req, res) {
  const requestData = {
    "id": messageHandler.mapListTypeToId(req, debugLog),
    "name": req.body.segmentName,
  };
  const messageType = "static segment add";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.lists.staticSegmentAdd(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

export function segmentDel(req, res) {
  const requestData = {
    "id": messageHandler.mapListTypeToId(req, debugLog),
    "seg_id": req.params.segmentId,
  };

  const messageType = "static segment delete";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.lists.staticSegmentDel(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

export function segmentMembersAdd(req, res) {
  const requestData = {
    "id": messageHandler.mapListTypeToId(req, debugLog),
    "seg_id": req.body.segmentId,
    "batch": req.body.segmentMembers,
  };
  const messageType = "static segment members add";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.lists.staticSegmentMembersAdd(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

export function segmentMembersDel(req, res) {
  const requestData = {
    "id": messageHandler.mapListTypeToId(req, debugLog),
    "seg_id": transforms.parse(req, "segmentId"),
    "batch": transforms.parse(req, "segmentMembers"),
  };
  const messageType = "static segment delete";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.lists.staticSegmentMembersDel(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

export function segmentReset(req, res) {
  const requestData = {
    "id": messageHandler.mapListTypeToId(req, debugLog),
    "seg_id": req.body.segmentId,
  };
  const messageType = "segment reset";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.lists.staticSegmentReset(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}

export function segments(req, res) {
  const requestData = {
    "id": messageHandler.mapListTypeToId(req, debugLog),
    "get_counts": true,
    "limit": 1000,
  };
  const messageType = "list segments";
  messageHandler.logRequestData(messageType, requestData, debugLog);
  mc.lists.staticSegments(requestData, function (responseData) {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }, function (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}
