import { Request, Response } from "express";
import { MailchimpListingResponse } from "../../../../projects/ngx-ramblers/src/app/models/mailchimp.model";
import { envConfig } from "../../env-config/env-config";
import { configuredMailchimp } from "../mailchimp-config";
import * as messageHandler from "../message-handler";
import debug from "debug";

const debugLog = debug(envConfig.logNamespace("mailchimp:campaigns:search"));

export async function mailchimpLists(req: Request, res: Response) {
  const mailchimpConfigData = await configuredMailchimp();
  const messageType = "list lists";
  mailchimpConfigData.mailchimp.lists.getAllLists({
    fields: ["lists.id",
      "lists.web_id",
      "lists.name",
      "lists.stats.member_count",
      "lists.stats.unsubscribe_count",
      "lists.stats.cleaned_count",
      "lists.stats.campaign_count",
      "lists.stats.campaign_last_sent",
      "lists.stats.merge_field_count"],
    status: "subscribed",
    offset: 0,
    count: 100
  }).then((responseData: MailchimpListingResponse) => {
    messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
  }).catch(error => {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}
