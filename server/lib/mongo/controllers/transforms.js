const _ = require("lodash");
const config = require("../../config/config");
const debug = require("debug")(config.logNamespace("transforms"));

exports.toObjectWithId = (document) => {
  return document ? {
    id: document._id,
    ...
      _.omit(document.toObject(), ["_id", "__v"])
  } : document;
}

exports.setUnSetDocument = (document, parent, parentResponse) => {
  const parentPath = parent ? parent + "." : "";
  const localResponse = parentResponse || {};
  _.each(document, (value, field) => {
    const fullPath = parentPath + field;
    if (_.includes([null, ""], value)) {
      debug("removing field:", fullPath, "[" + typeof (value) + "]", "value:", value);
      _.set(localResponse, ["$unset", fullPath], 1);
    } else if (typeof (value) === "object") {
      debug("setting nested field:", fullPath, "[" + typeof (value) + "]", "value:", value);
      this.setUnSetDocument(value, fullPath, localResponse);
    } else {
      debug("setting field:", fullPath, "[" + typeof (value) + "]", "value:", value);
      _.set(localResponse, ["$set", fullPath], value);
    }
  });
  return localResponse;
}

exports.criteriaAndDocument = req => {
  const criteria = {_id: req.params.id};
  const documentMinusIds = _.omit(req.body, ["_id", "__v", "id"]);
  const document = this.setUnSetDocument(documentMinusIds);
  return {criteria, document};
};
