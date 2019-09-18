"use strict";
const config = require("../config/config");
const debug = require("debug")(config.logNamespace("meetup"));
const moment = require("moment-timezone");
const url = require("url");
const https = require("https");
exports.config = function (req, res) {
  debug("meetup:config", JSON.stringify(config.meetup));
  return res.json(config.meetup);
};

const momentInTimezone = function (time) {
  return moment(time).tz("Europe/London");
};

let parseJsonData = function (data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    debug("ERROR:parsing JSON data", data, e)
    return {error: data};
  }
};

exports.events = function (req, res) {
  const urlParse = url.parse(config.meetup.apiUrl);
  const status = req.query.status || "upcoming";
  const dbReq = https.request({
    path: `/${config.meetup.group}/events?&sign=true&photo-host=public&page=20&status=${status}`,
    hostname: urlParse.host,
    protocol: urlParse.protocol,
    method: "get",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Bearer " + config.meetup.oauth.accessToken,
    },
  }, function (response) {
    let data = "";
    response.on("data", function (chunk) {
      data = data + chunk;
    });
    response.on("end", function () {
      res.statusCode = response.statusCode;
      res.httpVersion = response.httpVersion;
      res.trailers = response.trailers;
      res.headers = response.headers;
      const jsonData = parseJsonData(data);
      if (jsonData.error) {
        debug("ERROR: returned http status", response.statusCode, "from", req.url, req.params, "data:", data);
        res.json(jsonData);
      } else {
        const events = jsonData.map(function (result) {
          const returnedResult = {
            id: result.id,
            link: result.link,
            url: result.event_url,
            title: result.name,
            description: result.description,
            date: momentInTimezone(result.time).startOf("day").valueOf(),
            startTime: result.time,
          };

          if (result.duration) {
            returnedResult.endTime = result.time + result.duration;
          }
          return returnedResult;
        });
        debug("meetup:events - returned", events.length, req.query.status || "upcoming", "event(s)");
        res.json(events);
      }
    });
  });
  dbReq.end();
};

exports.handleAuth = function handleAuth(req, res) {
  debug("handleAuth called with req.query", req.query);
  debug("handleAuth called with req.url", req.url);
  debug("handleAuth called with req.path", req.path);
  res.json(req.result);
};
