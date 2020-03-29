"use strict";
const config = require("../config/config");
const debug = require("debug")(config.logNamespace("log-requests"));

exports.requests = (req, res) => {
  const path = req.path;
  const query = req.query;
  const body = req.body;
  const payload = req.body.additional[0];
  debug({path, query, payload: JSON.stringify(payload)});
  res.send({})
}
