let config = require('../../config');
let debug = require('debug')(config.logNamespace('ramblers:walksAndEventsManager'));
var url = require('url');
let _ = require('underscore');
let moment = require('moment-timezone');
let https = require('https');
let ramblersConfig = config.ramblers;

debug('Proxying requests at', ramblersConfig.url);

var createRequestOptions = function (req, requestUrl) {
  var ramblersUrl = url.parse(ramblersConfig.url);
  var requestOptions = {
    path: ramblersConfig.url + '/' + requestUrl,
    hostname: ramblersUrl.hostname,
    protocol: ramblersUrl.protocol,
    method: req.method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  debug('mapping Request from client path', req.method, req.url, '-> server path', requestOptions.path);
  if (!_.isEmpty(req.body)) debug('request body: ', req.body);
  return requestOptions;
};

function transformListWalksResponse(res, req, rawJson) {
  var walks = _(JSON.parse(rawJson)).map(function (walk) {
    var walkMoment = moment(walk.date, moment.ISO_8601).tz('Europe/London');
    return {
      ramblersWalkId: walk.id.toString(),
      ramblersWalkTitle: walk.title,
      ramblersWalkDate: walkMoment.format('dddd, Do MMMM YYYY'),
      ramblersWalkDateValue: walkMoment.valueOf()
    };
  });
  var returnData = {responseData: walks, information: 'Found ' + walks.length + ' walk(s)'};
  debug('returning', returnData);
  res.json(returnData);
}

function createErrorResponse(errorMessage) {
  debug(errorMessage);
  return {responseData: [], error: errorMessage};
}

function sendRequest(requestOptions, res, req, transformFunction) {
  try {
    var dbReq = https.request(requestOptions, function (dbRes) {
      var responseData = "";
      dbRes.setEncoding('utf8');
      dbRes.on('data', function (chunk) {
        responseData = (responseData + chunk).trim();
      });
      dbRes.on('error', function (error) {
        debug('ERROR: ', error);
      });
      dbRes.on('end', function () {
        res.headers = dbRes.headers;
        res.header('Content-Type', 'application/json');
        res.statusCode = dbRes.statusCode;
        res.httpVersion = dbRes.httpVersion;
        res.trailers = dbRes.trailers;
        transformFunction(res, req, responseData);
        res.end();
      });
    });
    dbReq.end();
  } catch (error) {
    debug('ERROR: ', error.stack);
    res.json(createErrorResponse(error));
    res.end();
  }
}

exports.listWalks = function (req, res) {
  sendRequest(createRequestOptions(req, ramblersConfig.listWalksPath), res, req, transformListWalksResponse);
};

exports.walkBaseUrl = function (req, res) {
  return res.send(ramblersConfig.url + '/go-walking/find-a-walk-or-route/walk-detail.aspx?walkID=');
};

exports.walkDescriptionPrefix = function (req, res) {
  return res.send(ramblersConfig.walkDescriptionPrefix);
};

