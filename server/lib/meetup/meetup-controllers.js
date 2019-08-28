"use strict";
let config = require("../config/config.js");
let debug = require("debug")(config.logNamespace("meetup"));
let meetupApi = require("meetup-api")({key: config.meetup.apiKey});
let moment = require("moment-timezone");
debug("meetupApi", meetupApi);

exports.config = function (req, res) {
  debug("meetup:config", JSON.stringify(config.meetup));
  return res.json(config.meetup);
};

let momentInTimezone = function (time) {
  return moment(time).tz("Europe/London");
};

exports.events = function (req, res) {
  var status = req.query.status || "upcoming";
  meetupApi.getEvents({
    group_urlname: config.meetup.group,
    status: status,
  }, function (err, resp) {
    if (err) {
      res.json(err);
    } else {
      let events = resp.results.map(function (result) {
        var returnedResult = {
          id: result.id,
          url: result.event_url,
          title: result.name,
          description: result.description,
          date: momentInTimezone(result.time).startOf("day").valueOf(),
          startTime: result.time,
          // fromTime: momentInTimezone(result.time),
          // dateFormatted: momentInTimezone(result.time).format('dddd, Do MMMM YYYY'),
          // startTimeFormatted: momentInTimezone(result.time).format('HH:mm')
        };

        if (result.duration) {
          returnedResult.endTime = result.time + result.duration;
          // returnedResult.endTimeFormatted = momentInTimezone(returnedResult.endTime).format('HH:mm')
        }
        return returnedResult;
      });
      debug("meetup:events - returned", events.length, status, "event(s)");
      res.json(events);
    }
  });
};

exports.handleAuth = function handleAuth(req, res) {
  debug("handleAuth called with req.query", req.query);
  debug("handleAuth called with req.url", req.url);
  debug("handleAuth called with req.path", req.path);
  res.json(req.result);
};
