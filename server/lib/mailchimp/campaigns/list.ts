import { Request, Response } from "express";
import { MailchimpCampaign, MailchimpCampaignListResponse } from "../../../../projects/ngx-ramblers/src/app/models/mailchimp.model";
import { envConfig } from "../../env-config/env-config";
import { MailchimpCampaignListRequest } from "../../shared/server-models";
import { asBoolean } from "../../shared/string-utils";
import { configuredMailchimp } from "../mailchimp-config";
import * as messageHandler from "../message-handler";
import debug from "debug";

const debugLog = debug(envConfig.logNamespace("mailchimp:campaigns:list"));

function campaignResponseFrom(campaigns: MailchimpCampaign[], responseData: MailchimpCampaignListResponse) {
  return {
    campaigns,
    total_items: campaigns.length,
    _links: responseData._links
  };
}

export function list(req: Request, res: Response): void {
  const messageType = "campaign list";
  configuredMailchimp().then(config => {
    const mailchimpCampaignListRequest: MailchimpCampaignListRequest = {
      query: req.query.query?.toString(),
      fields: asBoolean(req.query.concise) ? [
        "campaigns.create_time",
        "campaigns.id",
        "campaigns.long_archive_url",
        "campaigns.recipients.list_id",
        "campaigns.recipients.segment_opts.saved_segment_id",
        "campaigns.send_time",
        "campaigns.settings.from_name",
        "campaigns.settings.subject_line",
        "campaigns.settings.template_id",
        "campaigns.settings.title",
        "campaigns.status",
        "campaigns.web_id",
      ] : null,
      status: req.query.status?.toString(),
      type: "regular",
      offset: +req.query.start,
      count: +req.query.limit
    };

    function filterCampaigns(responseData: MailchimpCampaignListResponse, campaignListRequest: MailchimpCampaignListRequest): MailchimpCampaignListResponse {
      const campaigns: MailchimpCampaign[] = responseData.campaigns
        .filter((campaign: MailchimpCampaign) => {
          const campaignText = JSON.stringify(campaign).toLowerCase();
          const performQuery = !!campaignListRequest.query;
          const searchString = campaignListRequest.query?.toLowerCase();
          const match = campaignText.includes(searchString);
          return performQuery ? match : true;
        });
      return campaignResponseFrom(campaigns, responseData);
    }

    config.mailchimp.campaigns.list(mailchimpCampaignListRequest)
      .then((responseData: MailchimpCampaignListResponse) => {
        messageHandler.logRequestData(messageType + " response", campaignResponseFrom(responseData.campaigns, responseData), debugLog, req);
        messageHandler.processSuccessfulResponse(req, res, filterCampaigns(responseData, mailchimpCampaignListRequest), messageType, debugLog);
      });
  }).catch(error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}
