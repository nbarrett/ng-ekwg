const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const socialEventSchema = mongoose.Schema({
  notification: {type: Object},
  eventDate: {type: Number},
  eventTimeStart: {type: String},
  postcode: {type: String},
  briefDescription: {type: String},
  longerDescription: {type: String},
  displayName: {type: String},
  contactPhone: {type: String},
  contactEmail: {type: String},
}, {collection: "socialEvents"});

socialEventSchema.plugin(uniqueValidator);

module.exports = mongoose.model("social-event", socialEventSchema);
