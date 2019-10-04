"use strict";
const config = require("../config/config");
const messageHandlers = require("./message-handlers");
const debug = require("debug")(config.logNamespace("meetup:locations"));

exports.locations = function (req, res) {
  messageHandlers.httpRequest({
    debug: debug,
    res: res,
    req: req,
    requestOptions: {
      method: "get",
      path: `/find/locations?&sign=true&photo-host=public&query=${encodeURIComponent(req.query.query)}`,
    }
  }).then(response => res.json(response))
    .catch(error => res.json(error));
};
