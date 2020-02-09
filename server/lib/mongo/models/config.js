const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const configSchema = mongoose.Schema({
  mailchimp: {type: Object, required: true, unique: true},
  committee: {type: Object, required: true, unique: true},
  meetup: {type: Object, required: true, unique: true}
}, {collection: "config"});

configSchema.plugin(uniqueValidator);

module.exports = mongoose.model("config", configSchema);

