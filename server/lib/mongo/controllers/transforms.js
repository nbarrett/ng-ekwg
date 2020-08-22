const {omit, each, includes, set, isArray} = require("lodash");
const config = require("../../config/config");
const debug = require("debug")(config.logNamespace("transforms"));
debug.enabled = false;

exports.toObjectWithId = (document) => {
  return document ? {
    id: document._id,
    ...omit(document.toObject(), ["_id", "__v"]),
  } : document;
};

exports.setUnSetDocument = (document, parent, parentResponse) => {
  const parentPath = parent ? parent + "." : "";
  const localResponse = parentResponse || {};
  each(document, (value, field) => {
    if (typeof value === "string") {
      value = value.trim();
    }
    const fullPath = parentPath + field;
    if (includes([null, "", undefined], value)) {
      debug("removing field:", fullPath, "[" + typeof (value) + "]", "value:", value);
      set(localResponse, ["$unset", fullPath], 1);
    } else if (isArray(value)) {
      debug("setting array:", fullPath, "[" + typeof (value) + "]", "value:", value);
      set(localResponse, ["$set", fullPath], value);
    } else if (typeof (value) === "object") {
      debug("setting nested field:", fullPath, "[" + typeof (value) + "]", "value:", value);
      this.setUnSetDocument(value, fullPath, localResponse);
    } else {
      debug("setting field:", fullPath, "[" + typeof (value) + "]", "value:", value);
      set(localResponse, ["$set", fullPath], value);
    }
  });
  return localResponse;
};

exports.criteria = req => {
  return {_id: req.params.id};
};

exports.parse = (req, queryParameter) => {
  if (req.query) {
    const value = req.query[queryParameter];
    return value ? typeof value === "string" ? JSON.parse(value) : value : {};
  } else {
    return {};
  }
};

exports.parseQueryStringParameters = (req) => {
  return {
    criteria: exports.parse(req, "criteria"),
    limit: exports.parse(req, "limit"),
    select: exports.parse(req, "select"),
    sort: exports.parse(req, "sort"),
  };
};

exports.updateDocumentRequest = function(req) {
  const documentMinusIds = omit(req.body, ["_id", "__v", "id"]);
  return this.setUnSetDocument(documentMinusIds);
};

exports.createDocumentRequest = function(req) {
  return exports.createDocument(exports.updateDocumentRequest(req));
};

exports.createDocument = function(setUnSetDocument) {
  const response = {};
  const setFields = setUnSetDocument.$set;
  each(setFields, (value, field) => {
    set(response, field.split("."), value);
  });
  return response;
};

exports.criteriaAndDocument = req => {
  const criteria = exports.criteria(req);
  const document = exports.updateDocumentRequest(req);
  return {criteria, document};
};

exports.parseError = error => {
  if (error instanceof Error) {
    debug("parseError:returning Error:", error.toString());
    return error.toString();
  } else if (error.errmsg) {
    debug("parseError:returning errmsg:", error.errmsg);
    return error.errmsg;
  } else {
    debug("parseError:returning errmsg:", typeof error, error);
    return error;
  }
};
