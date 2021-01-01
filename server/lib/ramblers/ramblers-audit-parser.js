const {envConfig} = require("../env-config/env-config");
const debug = require("debug")(envConfig.logNamespace("ramblers:ramblers-audit-parser"));
debug.enabled = false;
const {some, isEmpty, isUndefined, includes} = require("lodash");
const errorIcons = ["⨯", "✗"];
const successIcons = ["✓"];
const npmErrorTokens = ["ERR!", "Error:", "failed"];

exports.anyMatch = (string, tokens) => {
  return some(tokens, (token => string.includes(token)));
};

exports.trimTokensFrom = (input, tokens) => {
  debug("trimTokensFrom:input:", input, "tokens:", tokens);
  let returnValue = input.trim();
  tokens.forEach(token => {
    returnValue = returnValue.replace(token, "").trim();
    debug("trimTokensFrom:token:", token, "returnValue:", returnValue);
  });
  debug("trimTokensFrom:returnValue:", returnValue.trim());
  return returnValue.trim();
};

exports.extractMessage = auditMessage => exports.trimTokensFrom(auditMessage, successIcons.concat(errorIcons));

exports.toStatusFromNpmMessage = auditMessageItem => exports.anyMatch(auditMessageItem, npmErrorTokens) ? "error" : "info";
exports.toStatusFromIcon = auditMessageItem => {
  if (exports.anyMatch(auditMessageItem, successIcons)) {
    return "success";
  } else if (exports.anyMatch(auditMessageItem, errorIcons)) {
    return "error";
  } else {
    return "info";
  }
};

exports.parseStandardOut = auditMessage => {
  debug("parseStandardOut:auditMessage:", auditMessage);
  return auditMessage.split(") ").map(auditMessageItem => {
    debug("parseStandardOut:auditMessageItem:", auditMessageItem);
    if (auditMessageItem === "\n"
      || isEmpty(auditMessageItem)
      || isUndefined(auditMessageItem)
      || auditMessageItem.length <= 2
      || exports.anyMatch(auditMessageItem, [envConfig.logNamespace(), "SceneTagged", "ActivityStarts"])) {
      return {audit: false}
    } else if (auditMessageItem.includes("ActivityFinished: ")) {
      const messageAndResult = auditMessageItem.split("ActivityFinished: ")[1].split(1);
      const status = messageAndResult[1].replace(")", "").toLowerCase().split("\n")[0].trim();
      const message = messageAndResult[0].trim();
      return {
        audit: true,
        type: "step",
        status: status,
        message: message
      }
    } else if (exports.anyMatch(auditMessage, successIcons.concat(errorIcons))) {
      return {
        audit: true,
        type: "step",
        status: exports.toStatusFromIcon(auditMessage),
        message: exports.extractMessage(auditMessage)
      }
    } else {
      return {
        audit: true,
        type: "step",
        status: exports.toStatusFromNpmMessage(auditMessageItem),
        message: exports.extractMessage(auditMessageItem)
      }
    }
  });
};

exports.parseStandardError = auditMessage => {
  debug("parseStandardError:auditMessage", auditMessage);
  if (isEmpty(auditMessage)
    || auditMessage.includes(envConfig.logNamespace())
    || includes(["\n", "", "npm"], auditMessage.trim())) {
    return [{
      audit: false
    }]
  } else {
    if (exports.anyMatch(auditMessage, errorIcons)) {
      return [{
        audit: true,
        type: "stderr",
        status: "error",
        message: exports.extractMessage(auditMessage)
      }]
    } else if (auditMessage.includes("ActivityFinished: ")) {
      const messageAndResult = auditMessage.split("ActivityFinished: ")[1].split(" (result: ");
      const status = messageAndResult[1].replace(")", "").toLowerCase().split("\n")[0].trim();
      const message = exports.extractMessage(messageAndResult[0]);
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
        message: exports.extractMessage(auditMessage)
      }]
    }
  }
};

exports.parseExit = auditMessage => {
  debug("parseExit:auditMessage", auditMessage);
  return [{
    audit: true,
    type: "step",
    status: "complete",
    message: exports.extractMessage(auditMessage)
  }]
};
