const _ = require("underscore");
const config = require("../../config/config");
const debug = require("debug")(config.logNamespace("transforms"));

exports.toObjectWithId = (document) => {
  debug("document", document)
  return document ? {
    id: document._id,
    ...
      _.omit(document.toObject(), ["_id", "__v"])
  } : document;
}
