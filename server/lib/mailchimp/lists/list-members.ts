import { Request, Response } from "express";
import { MailchimpListsMembersResponse } from "../../../../projects/ngx-ramblers/src/app/models/mailchimp.model";
import { envConfig } from "../../env-config/env-config";
import { configuredMailchimp } from "../mailchimp-config";
import * as messageHandler from "../message-handler";
import debug from "debug";

const debugLog = debug(envConfig.logNamespace("mailchimp:lists:list-members"));

export async function listMembers(req: Request, res: Response): Promise<void> {
  const messageType = "mailchimp-list-members";
  const listId = messageHandler.mapListTypeToId(req, debugLog);
  try {
    const mailchimpConfigData = await configuredMailchimp();
    mailchimpConfigData.mailchimp.lists.getListMembersInfo(listId, {
      fields: ["list_id",
        "members.web_id",
        "members.unique_email_id",
        "members.email_address",
        "members.status",
        "members.merge_fields",
        "members.last_changed"],
      status: "subscribed",
      offset: 0,
      count: 300
    }).then((responseData: MailchimpListsMembersResponse) => {
      messageHandler.processSuccessfulResponse(req, res, responseData, messageType, debugLog);
    }).catch(error => {
      messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
    });
  } catch (error) {
    messageHandler.processUnsuccessfulResponse(req, res, error, messageType, debugLog);
  }
}
