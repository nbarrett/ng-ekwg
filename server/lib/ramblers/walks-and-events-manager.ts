import { RamblersWalkResponse, RamblersWalksRawApiResponse } from "../../../projects/ngx-ramblers/src/app/models/ramblers-walks-manager";
import { envConfig } from "../env-config/env-config";
import { httpRequest } from "../shared/message-handlers";
import * as requestDefaults from "./request-defaults";
import debug from "debug";
import moment from "moment-timezone";

const debugLog = debug(envConfig.logNamespace("ramblers:walks-manager"));
debugLog.enabled = true;
const ramblersConfig = envConfig.ramblers;

export function listWalks(req, res) {
  const defaultOptions = requestDefaults.createApiRequestOptions();
  debugLog("listWalks:defaultOptions:", defaultOptions);
  httpRequest({
    apiRequest: {
      hostname: defaultOptions.hostname,
      protocol: defaultOptions.protocol,
      headers: defaultOptions.headers,
      method: "get",
      path: `/api/volunteers/walksevents?types=group-walk&limit=100&groups=${ramblersConfig.groupCode}&api-key=${ramblersConfig.apiKey}`
    },
    debug: debugLog,
    res,
    req,
    mapper: transformListWalksResponse
  }).then(response => res.json(response))
    .catch(error => res.json(error));
}

function transformListWalksResponse(response: RamblersWalksRawApiResponse): RamblersWalkResponse[] {
  debugLog("transformListWalksResponse:", response);
  return response.data.map(walk => {
    debugLog("transformListWalksResponse:walk:", response);
    const walkMoment = moment(walk.start_date_time, moment.ISO_8601).tz("Europe/London");
    return {
      id: walk.id,
      url: walk.url,
      walksManagerUrl: walk.url.replace("https://beta.ramblers.org.uk", ramblersConfig.url),
      title: walk.title,
      startDate: walkMoment.format("dddd, Do MMMM YYYY"),
      startDateValue: walkMoment.valueOf(),
      startLocationW3w: walk.start_location.w3w
    };
  });
}

