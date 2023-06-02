import { Request, Response } from "express";
import { MailchimpCampaignSearchResponse } from "../../../../projects/ngx-ramblers/src/app/models/mailchimp.model";
import { envConfig } from "../../env-config/env-config";
import { MailchimpCampaignSearchRequestOptions } from "../../shared/server-models";
import { asBoolean } from "../../shared/string-utils";
import { configuredMailchimp } from "../mailchimp-config";
import * as messageHandler from "../message-handler";
import debug from "debug";

const debugLog = debug(envConfig.logNamespace("mailchimp:campaigns:search"));

export function search(req: Request, res: Response): void {
  const messageType = "campaign search";
  configuredMailchimp().then(config => {
    const options: MailchimpCampaignSearchRequestOptions = {
      fields: asBoolean(req.query.concise) ? [
        "results.campaign.create_time",
        "results.campaign.id",
        "results.campaign.long_archive_url",
        "results.campaign.recipients.list_id",
        "results.campaign.recipients.segment_opts.saved_segment_id",
        "results.campaign.send_time",
        "results.campaign.settings.from_name",
        "results.campaign.settings.subject_line",
        "results.campaign.settings.template_id",
        "results.campaign.settings.title",
        "results.campaign.status",
        "results.campaign.web_id",
      ] : null,
    };
    debugLog("req.query:", req.query, "search options:", options);
    config.mailchimp.searchCampaigns.search(req.query.query, options)
      .then((responseData: MailchimpCampaignSearchResponse) => {
        messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
      });
  }).catch(error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}
