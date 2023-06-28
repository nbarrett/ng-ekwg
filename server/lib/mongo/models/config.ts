import mongoose = require("mongoose");
import uniqueValidator = require("mongoose-unique-validator");

const configSchema = mongoose.Schema({
  system: {type: Object, required: false, unique: true},
  mailchimp: {type: Object, required: false, unique: true},
  committee: {type: Object, required: false, unique: true},
  meetup: {type: Object, required: false, unique: true},
  key: {type: String, required: true, unique: true},
  value: {type: Object, required: false}
}, {collection: "config"});

configSchema.plugin(uniqueValidator);

export const config = mongoose.model("config", configSchema);
