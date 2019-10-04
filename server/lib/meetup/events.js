"use strict";
const config = require("../config/config");
const debug = require("debug")(config.logNamespace("meetup:events"));
const moment = require("moment-timezone");
const messageHandlers = require("./message-handlers");

exports.all = function (req, res) {
  const detail = req.query.detail && (req.query.detail === "true");
  const status = req.query.status || "upcoming";
  debug("detail type", typeof req.query.detail)
  messageHandlers.httpRequest({
    debug: debug,
    res: res,
    req: req,
    requestOptions: {
      method: "get",
      path: `/${config.meetup.group}/events?&sign=true&photo-host=public&page=20&status=${status}`,
    },
    mapper: detail ? undefined : toConciseResponse
  }).then(response => res.json(response))
    .catch(error => res.json(error));
};

exports.single = function (req, res) {
  messageHandlers.httpRequest({
    debug: debug,
    res: res,
    req: req,
    requestOptions: {
      method: "get",
      path: `/${config.meetup.group}/events/${req.params.eventId}`
    }
  }).then(response => res.json(response))
    .catch(error => res.json(error));
};

const momentInTimezone = function (time, format) {
  return moment(time, format).tz("Europe/London");
};

function toConciseResponse(jsonData) {
  return jsonData.map(function (result) {
    const returnedResult = {
      id: result.id,
      link: result.link,
      title: result.name,
      description: result.description,
      date: momentInTimezone(result.time).startOf("day").valueOf(),
      startTime: result.time,
    }

    if (result.duration) {
      returnedResult.endTime = result.time + result.duration;
    }
    return returnedResult;
  });
}
