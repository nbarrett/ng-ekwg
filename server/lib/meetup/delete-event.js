"use strict";
const config = require("../config/config");
const messageHandlers = require("../shared/message-handlers");
const requestDefaults = require("./request-defaults");
const debug = require("debug")(config.logNamespace("meetup:event-delete"));

exports.deleteEvent = function (req, res) {
  const defaultOptions = requestDefaults.createApiRequestOptions(req.body)
  messageHandlers.httpRequest({
    apiRequest: {
      hostname: defaultOptions.hostname,
      protocol: defaultOptions.protocol,
      headers: defaultOptions.headers,
      method: "delete",
      path: `/${config.meetup.group}/events/${req.params.eventId}`
    },
    successStatusCodes: defaultOptions.successStatusCodes,
    res: res,
    req: req,
    debug: debug
  }).then(response => res.json(response))
    .catch(error => res.json(error));
};
