let config = require('../../config.js');
let debug = require('debug')(config.logNamespace('ramblers:ramblersWalksFinder'));
let ramblersConfig = config.ramblers;
var url = require('url');
let _ = require('underscore');
let _str = require('underscore.string');
let moment = require('moment-timezone');
let cheerio = require('cheerio');
let sys = require("sys");
let qs = require('querystring');
let http = require('http');

debug('Proxying requests at', ramblersConfig.url);

var nearestTown = function (walk) {
  var nearestTown = [];
  if (walk.nearestTown) nearestTown.push(walk.nearestTown);
  if (walk.postcode) nearestTown.push(walk.postcode);
  return nearestTown.join(' / ');
};

var transformWalkToFormData = function (req) {
  if (_.isEmpty(req.body)) {
    return '';
  } else {
    var walk = req.body;
    var walkDateMoment = moment(walk.walkDate).tz("Europe/London");
    debug('transforming walk on', walkDateMoment.format('DD-MMM-YYYY'), 'into formData');
    var queryStringObject = {
      'id': walk.ramblersWalkId || 'new',
      'type': getType(req),
      'action': statusChangeAction(req),
      'GROUP_CODE': ramblersConfig.groupCode,
      'day': walkDateMoment.format('D'),
      'month': walkDateMoment.format('M'),
      'year': walkDateMoment.format('YYYY'),
      'WALK_APPROX_LOCATION': walk.briefDescriptionAndStartPoint,
      'WALK_START_GRIDREF': walk.gridReference,
      'WALK_NEAREST_TOWN': nearestTown(walk),
      'WALK_LONGDESC': walk.longerDescription,
      'WALK_CONTACT_PHONE': walk.contactPhone,
      'WALK_CONTACT_EMAIL': walk.contactEmail
    };

    var walkDescription = [];
    if (walk.includeWalkDescriptionPrefix) walkDescription.push(walk.walkDescriptionPrefix || ramblersConfig.walkDescriptionPrefix);
    if (walk.briefDescriptionAndStartPoint) walkDescription.push(walk.briefDescriptionAndStartPoint);
    queryStringObject['WALK_SHORTDESC'] = walkDescription.join('. ');
    if (walk.contactName) queryStringObject['WALK_CONTACT_NAME'] = _.first(walk.contactName.split(' '));
    if (walk.grade) queryStringObject['WALK_DIFFICULTY'] = walk.grade.substring(0, 1).toUpperCase();
    if (walk.distance) queryStringObject['WALK_DISTANCE_MILES'] = parseInt(walk.distance, 10);
    if (walk.startTime) {
      var walkStartMoment = moment(walk.startTime, 'HH mm');
      queryStringObject['hour'] = walkStartMoment.format('HH');
      queryStringObject['minute'] = walkStartMoment.format('mm');
    }
    var formData = qs.stringify(queryStringObject);
    debug('returning formData', formData);
    return formData;
  }
};

var createRequestOptions = function (req, requestUrl) {
  var ramblersUrl = url.parse(ramblersConfig.url);
  var requestOptions = {
    path: ramblersConfig.url + '/' + requestUrl + '?' + createQueryString(req),
    hostname: ramblersUrl.hostname,
    protocol: ramblersUrl.protocol,
    method: req.method,
    headers: {
      'Authorization': 'Basic ' + new Buffer(ramblersConfig.username + ':' + ramblersConfig.password).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  debug('mapping Request from client path', req.method, req.url, '-> server path', requestOptions.path);
  if (!_.isEmpty(req.body)) debug('request body: ', req.body);
  return requestOptions;
};

function transformListWalksResponse(res, req, rawHtml) {
  var anchorFilter = 'findGridRef.php?';
  var walks = [];
  $ = cheerio.load(rawHtml);
  $('a').filter(function (anchorIndex, anchor) {
    return (anchor.attribs && _str.include(anchor.attribs.href, anchorFilter));
  }).each(function (anchorIndex, anchor) {
    var textItems = _.chain(anchor.parent.children)
      .filter(function (element) {
        return element && (_.has(element, 'type') && _.has(element, 'data')) && element['type'] == 'text' && _str.include(element['data'], ':');
      }).map(function (element) {
        return element['data'].split(':')[1].trim();
      }).value();

    var titleItems = _.chain(anchor.parent.children)
      .filter(function (element) {
        return element && (_.has(element, 'type') && _.has(element, 'name')) && element['type'] == 'tag' && element['name'] == 'b';
      }).map(function (element) {
        return element.children;
      }).map(function (child) {
        return child[0]['data'];
      }).value();

    var queryString = _.last(anchor.attribs.href.split(anchorFilter));
    var walk = _.extend(qs.parse(queryString), _.object(titleItems, textItems));
    walks.push(walk);
  });
  return {responseData: walks, information: 'Found ' + walks.length + ' ' + getType(req) + ' walk(s)'};
}

function uploadCompleteResponse(res, req, rawHtml) {
  if (rawHtml) {
    return returnErrorResponseContainingHtml('Walk upload', rawHtml);
  } else {
    var response = {
      responseData: [rawHtml],
      information: 'Walk was uploaded successfully in ' + getType(req) + ' state'
    };
    debug(response);
    return response;
  }
}

function mapStatusChangeOutcome(outcome, expectedOutcome) {
  return 'Expected response ' + expectedOutcome + ' from ramblers but received ' + outcome + '. Possible cause: Ramblers walk probably does not exist - try unlinking and uploading a new walk';
}

function statusChangeResponse(res, req, rawHtml) {
  debug('statusChangeResponse: rawHtml received was ', rawHtml, 'location header', res.headers.location);
  var responsePrefix = 'Status change to ' + statusChangeAction(req) + ' for ' + getType(req) + ' walk';
  if (res.headers.location) {
    var outcome = qs.parse(res.headers.location)['message'];
    var expectedOutcome = statusChangeAction(req).substring(0, 1).toUpperCase() + '1';
    if (expectedOutcome === outcome) {
      return {responseData: [], information: responsePrefix + ' completed successfully'};
    } else {
      return createErrorResponse(mapStatusChangeOutcome(outcome, expectedOutcome));
    }
  } else if (rawHtml) {
    return returnErrorResponseContainingHtml(responsePrefix, rawHtml);
  }
}

function returnErrorResponseContainingHtml(responsePrefix, rawHtml) {
  debug('returnErrorResponseContainingHtml: raw html received was ', rawHtml);
  $ = cheerio.load(rawHtml);
  var parsedResponse = $('p')['0'].children[0].data;
  return createErrorResponse(responsePrefix + ' failed. Ramblers response was ' + parsedResponse);
}

function createErrorResponse(errorMessage) {
  debug(errorMessage);
  return {responseData: [], error: errorMessage};
}

function getType(req) {
  // can be unpublished, published
  return req.query.type || 'unpublished';
}

function statusChangeAction(req) {
  // can be add, remove, publish, delete
  return req.query.action || 'add';
}

function createQueryString(req) {
  var requestObject = {
    group: ramblersConfig.groupCode,
    type: getType(req),
    action: statusChangeAction(req),
    confirm: 1,
    updated: 1
  };
  if (req.query.id) requestObject.id = req.query.id;
  return qs.stringify(requestObject);
}

function sendRequest(requestOptions, res, req, transformFunction) {
  try {
    var formData = transformWalkToFormData(req);
    var dbReq = http.request(requestOptions, function (dbRes) {
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
        res.statusCode = dbRes.statusCode == '302' ? '200' : dbRes.statusCode;
        res.httpVersion = dbRes.httpVersion;
        res.trailers = dbRes.trailers;
        var transformFunctionResponse = transformFunction(res, req, responseData);
        debug('transformFunction returning', transformFunctionResponse);
        res.json(transformFunctionResponse);
        res.end();
      });
    });
    dbReq.end(formData);
  } catch (error) {
    debug('ERROR: ', error.stack);
    res.json(createErrorResponse(error));
    res.end();
  }
}

exports.uploadWalk = function (req, res) {
  sendRequest(createRequestOptions(req, 'editors/submit.php'), res, req, uploadCompleteResponse);
};

exports.changeWalkStatus = function (req, res) {
  sendRequest(createRequestOptions(req, 'editors/changeStatus.php'), res, req, statusChangeResponse);
};

exports.listWalks = function (req, res) {
  sendRequest(createRequestOptions(req, 'editors/list.php'), res, req, transformListWalksResponse);
};

exports.walkBaseUrl = function (req, res) {
  return res.send(ramblersConfig.url + '/walkInfo.php?id=');
};

exports.walkDescriptionPrefix = function (req, res) {
  return res.send(ramblersConfig.walkDescriptionPrefix);
};
