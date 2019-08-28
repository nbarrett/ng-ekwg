"use strict";
let config = require("../config/config.js");
let debug = require("debug")(config.logNamespace("ramblers:ramblers-audit-parser"));
let _ = require("underscore");
let _str = require("underscore.string");

exports.parseStandardOut = function (auditMessage) {
  debug("parseStandardOut:auditMessage", auditMessage);
  return _(auditMessage.split(") ")).map(function (auditMessageItem) {
    debug("auditMessageItem", auditMessageItem);

    function toStatus(auditMessageItem) {
      return _str.contains(auditMessageItem, "ERR!") || _str.contains(auditMessageItem, "Error:") || _str.contains(auditMessageItem, "failed") ? "error" : "info";
    }

    if (auditMessageItem === "\n"
      || _.isEmpty(auditMessageItem)
      || _.isUndefined(auditMessageItem)
      || auditMessageItem.length <= 2
      || _str.contains(auditMessageItem, config.logNamespace())
      || _str.contains(auditMessageItem, "SceneTagged")
      || _str.contains(auditMessageItem, "ActivityStarts")) {
      return {
        audit: false
      }
    } else if (_str.contains(auditMessageItem, "ActivityFinished: ")) {
      let messageAndResult = auditMessageItem.split("ActivityFinished: ")[1].split(" (result: ");
      let status = messageAndResult[1].replace(")", "").toLowerCase().split("\n")[0].trim();
      let message = messageAndResult[0].trim();
      return {
        audit: true,
        type: "step",
        status: status,
        message: message
      }
    } else {
      return {
        audit: true,
        type: "step",
        status: toStatus(auditMessageItem),
        message: auditMessageItem.trim()
      }
    }
  });
};

exports.parseStandardError = function (auditMessage) {
  debug("parseStandardError:auditMessage", auditMessage);
  if (_.isEmpty(auditMessage)
    || _str.contains(auditMessage, config.logNamespace())
    || _.includes(["\n", "", "npm"], auditMessage.trim())) {
    return [{
      audit: false
    }]
  } else if (_str.contains(auditMessage, "⨯")) {
    return [{
      audit: true,
      type: "stderr",
      status: "error",
      message: auditMessage.trim()
    }]
  } else if (_str.contains(auditMessage, "ActivityFinished: ")) {
    let messageAndResult = auditMessage.split("ActivityFinished: ")[1].split(" (result: ");
    let status = messageAndResult[1].replace(")", "").toLowerCase().split("\n")[0].trim();
    let message = messageAndResult[0].trim();
    debug("messageAndResult ->", messageAndResult, "status ->", status, "message ->", message);
    return [{
      audit: true,
      type: "step",
      status: status,
      message: message
    }]
  } else {
    return [{
      audit: true,
      type: "stderr",
      status: "info",
      message: auditMessage.trim()
    }]
  }
};

exports.parseExit = function (auditMessage) {
  debug("parseExit:auditMessage", auditMessage);
  return [{
    audit: true,
    type: "step",
    status: "complete",
    message: auditMessage.replace("✓", "").trim()
  }]
};
