'use strict';
let config = require('../config/config.js');
let debug = require('debug')(config.logNamespace('mongo-proxy'));
let url = require('url');
let _ = require('underscore');
let qs = require('querystring');
let https = require('https');

module.exports = function () {
  let dbUrlBasePath = config.mongo.dbUrl;
  let database = config.mongo.database;
  let apiKey = config.mongo.apiKey;

  debug('Proxying MongoLab at', dbUrlBasePath, 'with database', database, 'with APIKey', apiKey);

  let dbUrl = url.parse(dbUrlBasePath);

  let mapUrl = function (reqUrlString, collection, id) {
    let reqUrl = url.parse(reqUrlString, true);
    let newUrl = {
      hostname: dbUrl.hostname,
      protocol: dbUrl.protocol
    };
    let query = _.extend({}, reqUrl.query, {apiKey: apiKey});
    let idPath = id ? ('/' + id) : '';
    var action = collection ? ('/collections/' + collection) : '/runCommand';
    newUrl.path = dbUrlBasePath + '/' + database + action + idPath + '?' + qs.stringify(query);
    return newUrl;
  };

  let mapRequest = function (req) {
    let newReq = mapUrl(req.url, req.params.collection, req.params.id);
    newReq.method = req.method;
    newReq.headers = req.headers || {};
    newReq.headers.host = newReq.hostname;
    debug('Mapping request from', req.method, req.url, '->', newReq.path);
    if (!_.isEmpty(req.body)) debug('Request body: ', req.body);
    if (!_.isEmpty(req.query)) debug('Querystring: ', req.query);
    return newReq;
  };

  return function (req, res, next) {
    try {
      let options = mapRequest(req);
      let dbReq = https.request(options, function (dbRes) {
        let data = "";
        res.headers = dbRes.headers;
        dbRes.setEncoding('utf8');
        dbRes.on('data', function (chunk) {
          data = data + chunk;
        });
        dbRes.on('end', function () {
          res.header('Content-Type', 'application/json');
          res.statusCode = dbRes.statusCode;
          res.httpVersion = dbRes.httpVersion;
          res.trailers = dbRes.trailers;
          res.send(data);
          res.end();
          if (dbRes.statusCode !== 200) {
            debug('returned http status', dbRes.statusCode, 'data:', data);
          } else {
            debug('returned', JSON.parse(data).length, 'record(s)');
          }
        });
      });
      // Send any data the is passed from the original request
      dbReq.end(JSON.stringify(req.body));
    } catch (error) {
      debug('ERROR: ', error.stack);
      res.json(error);
      res.end();
    }
  };
};
