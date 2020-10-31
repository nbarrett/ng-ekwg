const {config} = require("../config/config");
const debug = require("debug")(config.logNamespace("meetup:config"));

exports.config = function (req, res) {
  debug("meetup:config", JSON.stringify(config.meetup));
  return res.json(config.meetup);
};
