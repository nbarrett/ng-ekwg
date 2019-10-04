"use strict";
const config = require("../config/config");
const messageHandlers = require("./message-handlers");
const debug = require("debug")(config.logNamespace("event-create"));

exports.createEvent = function (req, res) {
  messageHandlers.httpRequest({
    debug: debug,
    body: req.body,
    res: res,
    req: req,
    requestOptions: {
      method: "post",
      path: `/${config.meetup.group}/events`,
    },
  }).then(response => res.json(response))
    .catch(error => res.json(error));
};
