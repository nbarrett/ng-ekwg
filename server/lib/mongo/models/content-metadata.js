const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const ContentMetadataItem = mongoose.Schema({
  image: {type: String, required: true},
  text: {type: String, required: true}
});

const ContentMetadataSchema = mongoose.Schema({
  baseUrl: {type: String, required: true},
  contentMetaDataType: {type: String, required: true},
  files: [ContentMetadataItem]
}, {collection: "contentMetaData"});

ContentMetadataSchema.plugin(uniqueValidator);

module.exports = mongoose.model("content-metadata", ContentMetadataSchema);

