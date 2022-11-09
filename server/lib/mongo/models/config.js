const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const configSchema = mongoose.Schema({
  system: {type: Object, required: false, unique: true},
  mailchimp: {type: Object, required: false, unique: true},
  committee: {type: Object, required: false, unique: true},
  meetup: {type: Object, required: false, unique: true}
}, {collection: "config"});

configSchema.plugin(uniqueValidator);

module.exports = mongoose.model("config", configSchema);

