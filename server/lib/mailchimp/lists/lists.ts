import { Request, Response } from "express";
import { MailchimpApiError, MailchimpListingResponse } from "../../../../projects/ngx-ramblers/src/app/models/mailchimp.model";
import { envConfig } from "../../env-config/env-config";
import { configuredMailchimp } from "../mailchimp-config";
import * as messageProcessing from "../mailchimp-message-processing";
import debug from "debug";

const messageType = "mailchimp:lists:list";
const debugLog = debug(envConfig.logNamespace(messageType));

export function lists(req: Request, res: Response) {
  configuredMailchimp().then(config => {
    const listOptions = {
      fields: ["lists.id",
        "lists.web_id",
        "lists.name",
        "lists.stats.member_count",
        "lists.stats.unsubscribe_count",
        "lists.stats.cleaned_count",
        "lists.stats.campaign_count",
        "lists.stats.campaign_last_sent",
        "lists.stats.merge_field_count"],
      // status: "subscribed",
      offset: 0,
      count: 100
    };
    return config.mailchimp.lists.getAllLists(listOptions).then((responseData: MailchimpListingResponse) => {
      messageProcessing.successfulResponse(req, res, responseData, messageType, debugLog);
    });
  }).catch((error: MailchimpApiError) => {
    messageProcessing.unsuccessfulResponse(req, res, error, messageType, debugLog);
  });
}
