"use strict";
const config = require("../config/config");
const debug = require("debug")(config.logNamespace("meetup:venues"));
const messageHandlers = require("./message-handlers");
const querystring = require("querystring");

exports.create = function (req, res) {
  messageHandlers.httpRequest({
    debug: debug,
    body: req.body,
    res: res,
    req: req,
    requestOptions: {
      method: "post",
      path: `/${config.meetup.group}/venues`,
    },
  }).then(response => res.json(response))
    .catch(error => res.json(error));
};

// this doesn't work yet and is not used
exports.list = function (req, res) {
  messageHandlers.httpRequest({
    debug: debug,
    body: req.body,
    res: res,
    req: req,
    requestOptions: {
      method: "get",
      path: `/find_venues/search?${querystring.stringify(req.query)}`,
    },
  }).then(response => res.json(response))
    .catch(error => res.json(error));
};
