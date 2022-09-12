const mongoose = require("mongoose");

const PageContentColumn = mongoose.Schema({
  href: {type: String},
  title: {type: String},
  imageSource: {type: String},
  columns: {type: Number},
  contentTextId: {type: String},
}, { _id : false });

const PageContentRow = mongoose.Schema({
  type: {type: String, required: true},
  columns: [PageContentColumn]
}, { _id : false });

const pageContentSchema = mongoose.Schema({
  path: {type: String, required: true},
  rows: [PageContentRow]
}, {collection: "pageContent"});

module.exports = mongoose.model("page-content", pageContentSchema);
