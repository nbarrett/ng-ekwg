const mongoose = require("mongoose");

const PageContentColumn = {
  columns: {type: Number, required: true},
  contentTextId: {type: String}
};

const PageContentRow = {
  columns: [PageContentColumn]
};

const pageContentSchema = mongoose.Schema({
  path: {type: String, required: true},
  rows: [PageContentRow]
}, {collection: "pageContent"});

module.exports = mongoose.model("page-content", pageContentSchema);
