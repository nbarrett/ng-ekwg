import debug from "debug";
import { Request, Response } from "express";
import { MailchimpApiError, MailchimpCampaignContentUpdateRequest, MailchimpCampaignListResponse } from "../../../../projects/ngx-ramblers/src/app/models/mailchimp.model";
import { envConfig } from "../../env-config/env-config";
import { configuredMailchimp } from "../mailchimp-config";
import * as messageProcessing from "../mailchimp-message-processing";

const messageType = "mailchimp:campaigns:set-content";
const debugLog = debug(envConfig.logNamespace(messageType));

export function campaignSetContent(req: Request, res: Response): Promise<void> {

  return configuredMailchimp().then(config => {
    const mailchimpCampaignContentUpdateRequest: MailchimpCampaignContentUpdateRequest = req.body;
    return config.mailchimp.campaigns.update(req.params.campaignId, mailchimpCampaignContentUpdateRequest)
      .then((responseData: MailchimpCampaignListResponse) => {
        messageProcessing.successfulResponse(req, res, responseData, messageType, debugLog);
      });
  }).catch((error: MailchimpApiError) => {
    messageProcessing.unsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}
