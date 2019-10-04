"use strict";
const config = require("../config/config");
const messageHandlers = require("./message-handlers");
const debug = require("debug")(config.logNamespace("event-update"));

exports.updateEvent = function (req, res) {
  messageHandlers.httpRequest({
    debug: debug,
    body: req.body,
    res: res,
    req: req,
    requestOptions: {
      method: "patch",
      path: `/${config.meetup.group}/events/${req.params.eventId}`
    },
  }).then(response => res.json(response))
    .catch(error => res.json(error));
};
