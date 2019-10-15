"use strict";
const config = require("../config/config");
let ramblersConfig = config.ramblers;
const debug = require("debug")(config.logNamespace("ramblers:gwem"));
const moment = require("moment-timezone");
const messageHandlers = require("../shared/message-handlers");
const requestDefaults = require("./request-defaults");

exports.listWalks = function (req, res) {
  const defaultOptions = requestDefaults.createApiRequestOptions()
  messageHandlers.httpRequest({
    apiRequest: {
      hostname: defaultOptions.hostname,
      protocol: defaultOptions.protocol,
      headers: defaultOptions.headers,
      method: "get",
      path: ramblersConfig.listWalksPath + "?groups=" + ramblersConfig.groupCode
    },
    debug: debug,
    res: res,
    req: req,
    mapper: transformListWalksResponse
  }).then(response => res.json(response))
    .catch(error => res.json(error));
};

function transformListWalksResponse(jsonData) {
  return jsonData.map(function (walk) {
    var walkMoment = moment(walk.date, moment.ISO_8601).tz("Europe/London");
    return {
      ramblersWalkId: walk.id.toString(),
      ramblersWalkTitle: walk.title,
      ramblersWalkDate: walkMoment.format("dddd, Do MMMM YYYY"),
      ramblersWalkDateValue: walkMoment.valueOf(),
    };
  });
}

exports.walkBaseUrl = function (req, res) {
  return res.send(ramblersConfig.url + "/go-walking/find-a-walk-or-route/walk-detail.aspx?walkID=");
};
