import mailchimp from "@mailchimp/mailchimp_marketing";
import debug from "debug";
import { MailchimpConfigResponse } from "../../../projects/ngx-ramblers/src/app/models/mailchimp.model";
import { envConfig } from "../env-config/env-config";
import { MailchimpConfigData } from "../shared/server-models";
import transforms = require("../mongo/controllers/transforms");
import config = require("../mongo/models/config");

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
      return null;
    });
}

function resolvePrefix(result: MailchimpConfigResponse): string {
  const url = new URL(result.mailchimp.apiUrl);
  return url.host.split("\.")[0];
}

