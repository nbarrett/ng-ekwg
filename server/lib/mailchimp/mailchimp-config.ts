// @ts-ignore
import mailchimp = require("@mailchimp/mailchimp_marketing");
import debug = require("debug");
import transforms = require("../mongo/controllers/transforms");
import config = require("../mongo/models/config");
import { MailchimpConfigResponse } from "../../../projects/ng-ekwg/src/app/models/mailchimp.model";
import { envConfig } from "../env-config/env-config";

const debugLog = debug(envConfig.logNamespace("mailchimp-config"));

export function configuredMailchimp(): Promise<MailchimpConfigData> {
  return config.findOne({"mailchimp": {"$exists": true}})
    .then((result: MailchimpConfigResponse) => {
      mailchimp.setConfig({
        apiKey: envConfig.mailchimp.apiKey,
        server: resolvePrefix(result),
      });
      return {config: result, mailchimp};
    })
    .catch(error => {
      debugLog(`config error`, transforms.parseError(error));
    });
}

function resolvePrefix(result: MailchimpConfigResponse): string {
  const url = new URL(result.mailchimp.apiUrl);
  return url.host.split("\.")[0];
}

export interface MailchimpConfigData {
  config: MailchimpConfigResponse;
  mailchimp: any;
}
