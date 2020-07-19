const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const committeeFileSchema = mongoose.Schema({
  eventDate: {type: Number},
  postcode: {type: String},
  fileType: {type: String},
  fileNameData: {
    originalFileName: {type: String},
    awsFileName: {type: String},
    title: {type: String},
  }
}, {collection: "committeeFiles"});

committeeFileSchema.plugin(uniqueValidator);

module.exports = mongoose.model("committee-file", committeeFileSchema);
