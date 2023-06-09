import mailchimp from "@mailchimp/mailchimp_marketing";
import debug from "debug";
import { MailchimpConfig, MailchimpConfigResponse } from "../../../projects/ngx-ramblers/src/app/models/mailchimp.model";
import { envConfig } from "../env-config/env-config";
import { MailchimpConfigData } from "../shared/server-models";
import * as transforms from "../mongo/controllers/transforms";
import config = require("../mongo/models/config");

const debugLog = debug(envConfig.logNamespace("mailchimp-config"));

export function configuredMailchimp(): Promise<MailchimpConfigData> {
  debugLog("configuredMailchimp starting");
  return config.findOne({"mailchimp": {"$exists": true}})
    .then((mailchimpConfigResponse: MailchimpConfigResponse) => {
      mailchimp.setConfig({
        apiKey: mailchimpConfigResponse.mailchimp.apiKey,
        server: resolvePrefix(mailchimpConfigResponse.mailchimp),
      });
      return {config: mailchimpConfigResponse.mailchimp, mailchimp};
    })
    .catch(error => {
      debugLog("Error", transforms.parseError(error));
      throw error;
    });
}

function resolvePrefix(mailchimpConfig: MailchimpConfig): string {
  const url = new URL(mailchimpConfig.apiUrl);
  return url.host.split("\.")[0];
}

