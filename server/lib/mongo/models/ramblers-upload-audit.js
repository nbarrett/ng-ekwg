const mongoose = require("mongoose");

module.exports = mongoose.model("ramblers-upload-audit", mongoose.Schema({
  auditTime: {type: Number},
  errorResponse: {type: Object},
  fileName: {type: String},
  message: {type: String},
  status: {type: String},
  type: {type: String},
}, {collection: "ramblersUploadAudit"}));
