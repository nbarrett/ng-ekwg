const mongoose = require("mongoose");

module.exports = mongoose.model("ramblers-upload-audit", mongoose.Schema({
  auditTime: {type: Number},
  fileName: {type: String},
  type: {type: String},
  status: {type: String},
  message: {type: String},
  errorResponse: {type: Object}
}, {collection: "ramblersUploadAudit"}));

