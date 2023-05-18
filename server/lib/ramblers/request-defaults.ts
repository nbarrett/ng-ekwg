import { envConfig } from "../env-config/env-config";
import url = require("url");

export function createApiRequestOptions() {
  const ramblersUrl = url.parse(envConfig.ramblers.url);
  return {
    hostname: ramblersUrl.host,
    protocol: ramblersUrl.protocol,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  };
}
