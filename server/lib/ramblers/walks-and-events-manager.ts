import { envConfig } from "../env-config/env-config";
import moment = require("moment-timezone");
import { httpRequest } from "../shared/message-handlers";
import * as requestDefaults from "./request-defaults";
import debug = require("debug");

const debugLog = debug(envConfig.logNamespace("ramblers:gwem"));
debugLog.enabled = true;
const ramblersConfig = envConfig.ramblers;
debugLog("thus us a testy");

export function listWalks(req, res) {
  const defaultOptions = requestDefaults.createApiRequestOptions();
  debugLog("listWalks:defaultOptions:", defaultOptions);
  httpRequest({
    apiRequest: {
      hostname: defaultOptions.hostname,
      protocol: defaultOptions.protocol,
      headers: defaultOptions.headers,
      method: "get",
      path: ramblersConfig.listWalksPath + "?groups=" + ramblersConfig.groupCode
    },
    debug: debugLog,
    res,
    req,
    mapper: transformListWalksResponse
  }).then(response => res.json(response))
    .catch(error => res.json(error));
}

function transformListWalksResponse(jsonData) {
  debugLog("transformListWalksResponse:", jsonData);
  return jsonData.map(walk => {
    const walkMoment = moment(walk.date, moment.ISO_8601).tz("Europe/London");
    return {
      ramblersWalkId: walk.id.toString(),
      ramblersWalkTitle: walk.title,
      ramblersWalkDate: walkMoment.format("dddd, Do MMMM YYYY"),
      ramblersWalkDateValue: walkMoment.valueOf(),
    };
  });
}

export function walkBaseUrl(req, res) {
  const response = ramblersConfig.url + "/go-walking/find-a-walk-or-route/walk-detail.aspx?walkID=";
  debugLog("walkBaseUrl:", response);
  return res.send({response});
}
