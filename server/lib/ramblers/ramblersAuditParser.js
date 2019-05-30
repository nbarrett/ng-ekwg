'use strict';
let config = require('../config/config.js');
let debug = require('debug')(config.logNamespace('ramblers:ramblersAuditParser'));
let _ = require('underscore');
let _str = require('underscore.string');

exports.parseMessagesFrom = function (auditMessage) {
  debug('auditMessage', auditMessage);
  return _(auditMessage.split(") ")).map(function (auditMessageItem) {
    debug('auditMessageItem', auditMessageItem);
    if (auditMessageItem === '\n' || _str.contains(auditMessageItem, 'SceneTagged') || _str.contains(auditMessageItem, 'ActivityStarts')) {
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
    } else if (_str.contains(auditMessageItem, "✓") || _str.contains(auditMessageItem, "Upload completed")) {
      return {
        audit: true,
        type: "step",
        status: "complete",
        message: auditMessageItem.replace("✓", "").trim()
      }
    } else {
      return {
        audit: true,
        type: "detail",
        status: "info",
        message: auditMessageItem.trim()
      }
    }
  });
};
