"use strict";
const config = require("../config/config.js");
const debug = require("debug")(config.logNamespace("mongo-proxy"));
const url = require("url");
const _ = require("underscore");
const qs = require("querystring");
const https = require("https");

module.exports = function () {
  const dbUrlBasePath = config.mongo.dbUrl;
  const database = config.mongo.database;
  const apiKey = config.mongo.apiKey;
  const prohibitedCollections = ["members", "contentMetaData", "contentText", "config", "memberUpdateAudit", "expenseClaims", "ramblersUploadAudit", "walks"];
  debug("Proxying MongoLab at", dbUrlBasePath, "with database", database, "with APIKey", apiKey);

  const dbUrl = url.parse(dbUrlBasePath);

  const mapUrl = function (reqUrlString, collection, id) {
    const reqUrl = url.parse(reqUrlString, true);
    const newUrl = {
      hostname: dbUrl.hostname,
      protocol: dbUrl.protocol,
    };
    const query = _.extend({}, reqUrl.query, {apiKey: apiKey});
    const idPath = id ? ("/" + id) : "";
    var action = collection ? ("/collections/" + collection) : "/runCommand";
    newUrl.path = dbUrlBasePath + "/" + database + action + idPath + "?" + qs.stringify(query);
    return newUrl;
  };

  const mapRequest = function (req) {
    const newReq = mapUrl(req.url, req.params.collection, req.params.id);
    newReq.method = req.method;
    newReq.headers = req.headers || {};
    newReq.headers.host = newReq.hostname;
    debug("Mapping request from", req.method, req.url, "->", newReq.path);
    if (!_.isEmpty(req.body)) {
      debug("Request body: ", req.body);
    }
    if (!_.isEmpty(req.query)) {
      debug("Querystring: ", req.query);
    }
    return newReq;
  };

  return function (req, res, next) {
    try {
      const options = mapRequest(req);
      debug("options", options);
      const dbReq = https.request(options, function (dbRes) {
        if (prohibitedCollections.includes(req.params.collection)) {
          res.statusCode = 401;
          res.json({error: "Unauthorised access to " + req.params.collection + " collection"});
          res.end();
        } else {
          let data = "";
          res.headers = dbRes.headers;
          dbRes.setEncoding("utf8");
          dbRes.on("data", function (chunk) {
            data = data + chunk;
          });
          dbRes.on("end", function () {
            res.header("Content-Type", "application/json");
            res.statusCode = dbRes.statusCode;
            res.httpVersion = dbRes.httpVersion;
            res.trailers = dbRes.trailers;
            res.send(data);
            res.end();
            if (dbRes.statusCode !== 200) {
              debug("returned http status", dbRes.statusCode, "data:", data);
            } else {
              debug("returned", JSON.parse(data).length, "record(s) from", req.params.collection);
            }
          });
        }
      });
      dbReq.on("error", error => {
        debug("on.ERROR: ", error.stack);
      });
      dbReq.end(JSON.stringify(req.body));
    } catch (error) {
      debug("ERROR: ", error.stack);
      res.json(error);
      res.end();
    }
  };
};
