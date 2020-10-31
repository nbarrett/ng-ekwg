const {config} = require("../config/config");
const messageHandlers = require("../shared/message-handlers");
const debug = require("debug")(config.logNamespace("event-update"));
const requestDefaults = require("./request-defaults");

exports.updateEvent = function (req, res) {
  const defaultOptions = requestDefaults.createApiRequestOptions(req.body)
  messageHandlers.httpRequest({
    apiRequest: {
      hostname: defaultOptions.hostname,
      protocol: defaultOptions.protocol,
      headers: defaultOptions.headers,
      method: "patch",
      path: `/${config.meetup.group}/events/${req.params.eventId}`,
    },
    body: req.body,
    successStatusCodes: defaultOptions.successStatusCodes,
    res: res,
    req: req,
    debug: debug
  }).then(response => res.json(response))
    .catch(error => res.json(error));
};
